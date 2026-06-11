import {
    ReactElement,
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    KeyboardEvent
} from "react";
import classNames from "classnames";
import Big from "big.js";

export interface CountOption {
    value: Big;
    label: string;
}

export interface CountComboboxProps {
    name: string;
    options: CountOption[];
    selectedValue?: Big;
    onSelect: (value: Big | undefined) => void;
    searchable: boolean;
    disabled: boolean;
    placeholder: string;
    noResultsText: string;
    hasError: boolean;
}

function parseBig(text: string): Big | undefined {
    try {
        return new Big(text);
    } catch {
        return undefined;
    }
}

export function CountCombobox(props: CountComboboxProps): ReactElement {
    const { options, selectedValue, onSelect, searchable, disabled, placeholder, noResultsText, hasError } = props;

    const [open, setOpen] = useState(false);
    // null = not editing, input mirrors the selected label; string = user is typing
    const [text, setText] = useState<string | null>(null);
    const [highlighted, setHighlighted] = useState(-1);

    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedLabel = useMemo(() => {
        if (selectedValue === undefined) {
            return "";
        }
        const match = options.find(o => o.value.eq(selectedValue));
        return match ? match.label : selectedValue.toString();
    }, [options, selectedValue]);

    const displayText = text !== null ? text : selectedLabel;

    const filteredOptions = useMemo(() => {
        if (text === null || text.trim() === "") {
            return options;
        }
        const term = text.trim().toLowerCase();
        return options.filter(o => o.label.toLowerCase().includes(term));
    }, [options, text]);

    const closeAndRevert = useCallback(() => {
        setOpen(false);
        setText(null);
        setHighlighted(-1);
    }, []);

    const openMenu = useCallback(() => {
        if (disabled || open) {
            return;
        }
        setOpen(true);
        setHighlighted(selectedValue !== undefined ? options.findIndex(o => o.value.eq(selectedValue)) : -1);
    }, [disabled, open, options, selectedValue]);

    const selectOption = useCallback(
        (option: CountOption) => {
            onSelect(option.value);
            closeAndRevert();
        },
        [onSelect, closeAndRevert]
    );

    // Commit whatever is typed: empty clears the value, an exact/numeric match selects it,
    // anything else reverts to the previously selected value.
    const commitText = useCallback(() => {
        if (text === null) {
            setOpen(false);
            setHighlighted(-1);
            return;
        }
        const trimmed = text.trim();
        if (trimmed === "") {
            onSelect(undefined);
            closeAndRevert();
            return;
        }
        const parsed = parseBig(trimmed);
        const match =
            options.find(o => o.label === trimmed) ??
            (parsed !== undefined ? options.find(o => o.value.eq(parsed)) : undefined);
        if (match) {
            onSelect(match.value);
        }
        closeAndRevert();
    }, [text, options, onSelect, closeAndRevert]);

    // Outside click: commit the typed text and close
    useEffect(() => {
        if (!open) {
            return;
        }
        const handler = (e: MouseEvent): void => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                commitText();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, commitText]);

    // Keep highlighted option in view
    useEffect(() => {
        if (open && highlighted >= 0 && listRef.current) {
            const item = listRef.current.children[highlighted] as HTMLElement | undefined;
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [open, highlighted]);

    const handleInputChange = useCallback(
        (value: string) => {
            if (!searchable) {
                return;
            }
            setText(value);
            setHighlighted(0);
            if (!open) {
                setOpen(true);
            }
        },
        [searchable, open]
    );

    const handleFocus = useCallback(() => {
        openMenu();
        if (searchable) {
            // Select existing text so typing replaces it immediately
            inputRef.current?.select();
        }
    }, [openMenu, searchable]);

    const toggleMenu = useCallback(() => {
        if (disabled) {
            return;
        }
        if (open) {
            commitText();
        } else {
            inputRef.current?.focus();
            openMenu();
        }
    }, [disabled, open, commitText, openMenu]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (disabled) {
                return;
            }
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    if (!open) {
                        openMenu();
                    } else {
                        setHighlighted(prev => Math.min(prev + 1, filteredOptions.length - 1));
                    }
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlighted(prev => Math.max(prev - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (open && highlighted >= 0 && highlighted < filteredOptions.length) {
                        selectOption(filteredOptions[highlighted]);
                    } else {
                        commitText();
                    }
                    break;
                case "Escape":
                    closeAndRevert();
                    break;
                case "Tab":
                    commitText();
                    break;
                default:
                    break;
            }
        },
        [disabled, open, openMenu, filteredOptions, highlighted, selectOption, commitText, closeAndRevert]
    );

    return (
        <div
            ref={rootRef}
            className={classNames("count-selection", {
                "count-selection--open": open,
                "count-selection--disabled": disabled,
                "has-error": hasError
            })}
            onKeyDown={handleKeyDown}
        >
            <div className="count-selection__control">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control count-selection__input"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete={searchable ? "list" : "none"}
                    value={displayText}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={!searchable}
                    onChange={e => handleInputChange(e.target.value)}
                    onFocus={handleFocus}
                    onClick={openMenu}
                />
                <button
                    type="button"
                    className="count-selection__caret-button"
                    tabIndex={-1}
                    aria-label="Toggle options"
                    disabled={disabled}
                    onMouseDown={e => {
                        // Prevent the input losing focus / outside-click handler firing first
                        e.preventDefault();
                        toggleMenu();
                    }}
                >
                    <span className="count-selection__caret" aria-hidden="true" />
                </button>
            </div>
            {open ? (
                <div className="count-selection__menu">
                    <ul className="count-selection__list" role="listbox" ref={listRef}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const isSelected = selectedValue !== undefined && option.value.eq(selectedValue);
                                return (
                                    <li
                                        key={option.label}
                                        role="option"
                                        aria-selected={isSelected}
                                        className={classNames("count-selection__option", {
                                            "count-selection__option--selected": isSelected,
                                            "count-selection__option--highlighted": index === highlighted
                                        })}
                                        onMouseDown={e => {
                                            // mousedown instead of click so it wins over the input blur
                                            e.preventDefault();
                                            selectOption(option);
                                        }}
                                        onMouseEnter={() => setHighlighted(index)}
                                    >
                                        {option.label}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="count-selection__no-results">{noResultsText}</li>
                        )}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
