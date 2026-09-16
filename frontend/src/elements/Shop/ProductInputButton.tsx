import { useState } from "react"

type Props = {
    value?: number;
    onChange?: (value: number) => void;
};

export default function ProductInputButton({ value, onChange }: Props = {}){
    const [internalValue, setInternalValue] = useState<number>(1);
    const isControlled = value !== undefined;
    const inputValue = isControlled ? value : internalValue;
    const setInputValue = (updater: (prev: number) => number) => {
        const next = updater(inputValue);
        if (isControlled) onChange?.(next);
        else setInternalValue(next);
    };
    function handleIncrease() {
        setInputValue(prev => prev + 1);
    }
    function handleDecrease() {
        setInputValue(prev => (prev > 1 ? prev - 1 : prev));
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue) && newValue > 0) {
            if (isControlled) onChange?.(newValue);
            else setInternalValue(newValue);
        }
    }
    return(
        <div className="input-group bootstrap-touchspin">
            <span className="input-group-addon bootstrap-touchspin-prefix" style={{display: "none"}}></span>
            <input type="text" value={inputValue} name="demo_vertical2" className="form-control" style={{display: "block"}} 
                onChange={handleChange}
            />
            <span className="input-group-addon bootstrap-touchspin-postfix" style={{display: "none"}}></span>
            <span className="input-group-btn-vertical">
                <button className="btn btn-default bootstrap-touchspin-up" type="button"
                    onClick={handleIncrease}
                >
                    <i className="fa-solid fa-plus"/>
                </button>
                <button className="btn btn-default bootstrap-touchspin-down" type="button"
                    onClick={handleDecrease}
                >
                    <i className="fa-solid fa-minus"/>
                </button>
            </span>
        </div>
    )
}