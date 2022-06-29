import React, { useEffect, useRef } from 'react';
import Styles from './Tabs.module.scss';

/**
 * Show tabs for toggling between options
 **/
export default function Tabs<O extends string>({options, selected, onSelect}: {options: Readonly<{
    id: O,
    label: string
}[]>, selected?: O, onSelect: (option: O) => void }) {
    const selectedRef = useRef<HTMLParagraphElement>(null);
    const guideRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        guideRef.current!.style['opacity'] = selectedRef.current ? "1" : "0"; 
        guideRef.current!.style['width'] = selectedRef.current ? selectedRef.current.clientWidth + "px" : "0px";
        guideRef.current!.style['left'] = selectedRef.current ? selectedRef.current.offsetLeft + "px" : "initial";
        guideRef.current!.style['top'] = selectedRef.current ? selectedRef.current.offsetTop + selectedRef.current.clientHeight + "px" : "initial";
    }, [selected]);
    return <>
        <div className={Styles.container}>
            {options.map(o => <p ref={selected === o.id ? selectedRef : undefined} onClick={() => onSelect(o.id)} className={selected === o.id ? Styles.selected : ""} key={o.id} data-testid="tab-option">{o.label}</p>)}
            <div ref={guideRef} className={Styles.guide} data-testid="tab-guide"/>
        </div>
    </>;
}