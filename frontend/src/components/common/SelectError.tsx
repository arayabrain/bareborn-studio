import {MenuItem, Select, styled, Typography} from "@mui/material";
import React from "react";

const SelectError = ({value, onChange, onBlur, errorMessage, options }: any) => {
    return (
        <>
            <SelectModal
                value={value}
                onChange = {onChange}
                onBlur = {onBlur}
                error={!!errorMessage}
            >
                {
                    options.map((item: string) => {
                        return (
                            <MenuItem key={item} value={item}>{item}</MenuItem>
                        )
                    })
                }
            </SelectModal>
            <TextError>{errorMessage}</TextError>
        </>
    )
}

const SelectModal = styled(Select, {
    shouldForwardProp : (props) => props !== 'error',
})<{error: boolean}>(({theme,error })=>({
    width : 272,
    marginBottom : '15px',
    border : '1px solid #d9d9d9',
    borderColor: error ? 'red' : '#d9d9d9',
    borderRadius : 4
}))

const TextError = styled(Typography)({
    fontSize: 12,
    minHeight: 18,
    color: 'red',
    lineHeight: '14px',
    margin: "-14px 0px 0px 305px",
    wordBreak: 'break-word',
})
export default SelectError;