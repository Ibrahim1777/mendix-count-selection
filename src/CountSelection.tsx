import { ReactElement, createElement, useCallback, useMemo } from "react";
import Big from "big.js";

import { CountSelectionContainerProps } from "../typings/CountSelectionProps";
import { CountCombobox, CountOption } from "./components/CountDropdown";

import "./ui/CountSelection.css";

const MAX_OPTIONS = 5000;

function decimalPlaces(value: Big): number {
    const str = value.toString();
    const idx = str.indexOf(".");
    return idx === -1 ? 0 : str.length - idx - 1;
}

export function CountSelection(props: CountSelectionContainerProps): ReactElement {
    const { valueAttribute, minValue, maxValue, stepSize, searchable, placeholder, noResultsText, onChangeAction } =
        props;

    const ready =
        valueAttribute.status === "available" &&
        minValue.status === "available" &&
        maxValue.status === "available" &&
        stepSize.status === "available" &&
        minValue.value !== undefined &&
        maxValue.value !== undefined &&
        stepSize.value !== undefined;

    const options: CountOption[] = useMemo(() => {
        if (!ready) {
            return [];
        }
        const min = minValue.value as Big;
        const max = maxValue.value as Big;
        const step = stepSize.value as Big;

        if (step.lte(0)) {
            console.warn("CountSelection: step size must be greater than 0");
            return [];
        }
        if (max.lt(min)) {
            console.warn("CountSelection: maximum value is smaller than minimum value");
            return [];
        }

        // Display precision derived from the configured values, so 0.5 shows as "0.5" and 1 as "1"
        const dp = Math.max(decimalPlaces(min), decimalPlaces(step));

        const result: CountOption[] = [];
        let current = min;
        while (current.lte(max)) {
            result.push({ value: current, label: current.toFixed(dp) });
            if (result.length >= MAX_OPTIONS) {
                console.warn(
                    `CountSelection: option list truncated at ${MAX_OPTIONS} items. ` +
                        "Check the min/max/step configuration."
                );
                break;
            }
            current = current.plus(step);
        }
        return result;
    }, [ready, minValue.value, maxValue.value, stepSize.value]);

    const handleSelect = useCallback(
        (value: Big | undefined) => {
            const previous = valueAttribute.value;
            valueAttribute.setValue(value);
            const changed =
                previous === undefined || value === undefined ? previous !== value : !previous.eq(value);
            if (changed && onChangeAction && onChangeAction.canExecute && !onChangeAction.isExecuting) {
                onChangeAction.execute();
            }
        },
        [valueAttribute, onChangeAction]
    );

    if (!ready) {
        return <div className="widget-count-selection" />;
    }

    const validation = valueAttribute.validation;

    return (
        <div className="widget-count-selection">
            <CountCombobox
                name={props.name}
                options={options}
                selectedValue={valueAttribute.value}
                onSelect={handleSelect}
                searchable={searchable}
                disabled={valueAttribute.readOnly}
                placeholder={placeholder?.value ?? ""}
                noResultsText={noResultsText?.value ?? "No results found"}
                hasError={!!validation}
            />
            {validation ? <div className="alert alert-danger mx-validation-message">{validation}</div> : null}
        </div>
    );
}
