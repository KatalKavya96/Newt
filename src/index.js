import { useEffect, useState } from "react";
export default function generate(fn){

    let subscriptions = []
    let globalStore = {
        current : fn((merge)=>{

            if (typeof (merge)==="function"){

                merge = merge(globalStore.current)
            }

            globalStore.current = {...globalStore.current,...merge}

            subscriptions.forEach(sub=>sub(globalStore.current))
        },

        ()=>globalStore.current
    )
    }

    return [

        (chooser,dependencies)=>{

            let chosen = chooser ? chooser(globalStore.current) : globalStore.current
            const [chunk,setChunk] = useState(()=>chosen)

            useEffect(()=>{

                const comparator = () => {

                    let nextChosen = chosen ? chooser(globalStore.current) : globalStore.current

                    if (chunk !== nextChosen && typeof (nextChosen) === "object" && !Array.isArray(nextChosen)){

                        nextChosen = Object.entries(nextChosen).reduce((acc,[key,value])=>(chunk[key]!==value) ? {...acc,[key]:value} : acc , chunk)

                    }

                    if (nextChosen!==chunk){

                        setChunk(()=>nextChosen)
                    }

                    
                }
                subscriptions.push(comparator)

                return ()=>(subscriptions = subscriptions.filter(i => i !== comparator))
                
            },dependencies || [chosen])

            return chosen
        },

        {

            subscribe : fn =>{

                subscriptions.push(fn)
                return ()=>(subscriptions = subscriptions.filter(i => i!==fn ))

            },

            accessState : () => globalStore.current,

            reset : () =>{

                subscriptions = []
                globalStore.current = {}

            },
        }
    ]
}