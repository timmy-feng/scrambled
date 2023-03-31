import React, { useEffect, useState } from "react";

// pics
const lockedEgg = "/stun-1.png";
const selectedEgg = "/eat-4.png";
const unlockedEgg = "/yolk-head.png";
const EAT = ["eat-1.png", "eat-2.png", "eat-3.png", "eat-4.png"];

// props: enabled, costume 
// setDetails, setSelected
const fps = 12

const DressedEgg = ({isEnabled, costume, details, selected, i, setDetails, setSelected}) => {
    const [srcEgg, setSrcEgg] = useState();

    useEffect(()=>{
        setSrcEgg(isEnabled ? (i == details ? selectedEgg : unlockedEgg) : lockedEgg)
    },[isEnabled, details])

    const doEatAnim = () => {
        const i = 0

        const loop = (i) => {
            setTimeout(function(){
                if (i < 4){
                    setSrcEgg(EAT[i])
                    i++;
                    loop(i)
                }
            }, 1000/fps)
        }
        loop(i)
    }

    return (
        <div
            className="Costumes-button"
            onClick={() => {
                setDetails(i); // sets the index of costume to look at
                if (isEnabled) { // if user unlocked before
                    setSelected(i); 
                    doEatAnim();
                    //do animation
                }
            }}
        >
            <div className="Costumes-dressed-egg">
                <img
                    className="Costumes-egg"
                    src={srcEgg}
                />
                {i ? <img className="Costumes-costume" src={costume} /> : null}
                <div 
                    className="Costumes-dummy-hover"
                    onMouseEnter={()=>{setDetails(i)}}
                    onMouseLeave={()=>{
                    setDetails(selected)}}
                >
                </div>
            </div>
        </div>
    )
}

export default DressedEgg