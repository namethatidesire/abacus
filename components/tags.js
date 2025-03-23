import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {CircularProgress} from "@mui/material";

export default function Tags({ value, onChange }) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
        (async () => {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/tag', {method: 'GET'});
            const tags = await response.json();
            setLoading(false);

            setOptions(tags);
        })();
    };

    const handleClose = () => {
        setOpen(false);
        setOptions([]);
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            value={value}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            isOptionEqualToValue={(option, value) => {
                if (typeof option === 'string' && typeof value === 'string') {
                    return option === value;
                }
                return option && value ? option.name === value.name : false;
            }}
            getOptionLabel={(option) => option ? option.name : ""}
            options={options}
            loading={loading}
            onChange={(event, newValue) => {
                onChange(newValue);
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    const label = typeof option === 'string' ? option : option.name;
                    return (
                        <Chip variant="outlined" label={label} key={key} {...tagProps} />
                    );
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Tags"
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        },
                    }}
                />
            )}
        />
    )
}