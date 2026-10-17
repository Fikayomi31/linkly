import { useState } from "react";
import { Eye, EyeOff } from "react-feather";

import "./PasswordInput.css";

function PasswordInput({ value, onChange, placeholder="Enter password", name="password", id="password", isRequired=true }) {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="password-input">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                name={name}
                id={id}
                required={isRequired}
                className="password-input-field"
            />
            <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}


            </button>
         

        </div>
    )

}

export default PasswordInput