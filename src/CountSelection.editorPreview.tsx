import { ReactElement, createElement } from "react";
import { CountSelectionPreviewProps } from "../typings/CountSelectionProps";

export function preview(props: CountSelectionPreviewProps): ReactElement {
    const label = props.valueAttribute ? `[${props.valueAttribute}]` : "Count Selection";
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #ced0d3",
                borderRadius: 4,
                padding: "6px 12px",
                background: "#fff",
                color: "#6c717c"
            }}
        >
            <span>{label}</span>
            <span
                style={{
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid #6c717c"
                }}
            />
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/CountSelection.css");
}
