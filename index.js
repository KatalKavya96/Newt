import { useEffect, useState, useRef } from "react";
export default function generate(fn){

    
    let globalStore = {
        subscriptions : [],
        current : fn((merge)=>{

            if (typeof (merge)==="function"){

                merge = merge(globalStore.current)
            }

            globalStore.current = Object.assign({}, globalStore.current, merge)

            globalStore.subscriptions.forEach(sub=>sub(globalStore.current))
        },

        ()=>globalStore.current
    )
    }

    return [

        (chooser,dependencies)=>{

            let chosen = chooser ? chooser(globalStore.current) : {...globalStore.current}
            const [chunk,setChunk] = useState(()=>chosen)
            const liveChunk = useRef()

            useEffect (()=>{liveChunk.current=chunk},[chunk])

            useEffect( ()=>{ 

                const comparator = () => {

                    let nextChosen = chooser ? chooser(globalStore.current) : {...globalStore.current}

                    if (liveChunk.current !== nextChosen && typeof (nextChosen) === "object" && !Array.isArray(nextChosen)){

                        nextChosen = Object.entries(nextChosen).reduce((acc,[key,value])=>(liveChunk.current[key]!==value) ? {...acc,[key]:value} : acc , liveChunk.current)

                    }

                    if (nextChosen!==liveChunk.current){

                        setChunk(()=>nextChosen)
                    }

                    
                }
                globalStore.subscriptions.push(comparator)

                return ()=>(globalStore.subscriptions = globalStore.subscriptions.filter(i => i !== comparator))
                
            },dependencies || [chooser])

            return chosen
        },

        {

            subscribe : fn =>{

                globalStore.subscriptions.push(fn)
                return ()=>(globalStore.subscriptions = globalStore.subscriptions.filter(i => i!==fn ))

            },

            accessState : () => globalStore.current,

            reset : () =>{

                globalStore.subscriptions.forEach(unsub => {if (typeof unsub === "function"){unsub()}})
                globalStore.subscriptions = []
                globalStore.current = {}

            },

            update: (mergeOrFn) => {
                const merge =
                  typeof mergeOrFn === "function"
                    ? mergeOrFn(globalStore.current)
                    : mergeOrFn;
            
                globalStore.current = {
                  ...globalStore.current,
                  ...merge,
                };
            
                globalStore.subscriptions.forEach((sub) => sub(globalStore.current));
              },
        }
    ]
}