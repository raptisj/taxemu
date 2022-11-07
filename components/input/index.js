import { NumberField, NumberCounterField } from "./NumberInputs";
import { Vertical } from "./Radios";
import { CheckboxGroup } from "./Checkbox";
import { Checkbox, CheckboxWithTooltip, CheckboxNested } from "./CheckboxV2";
import RadioGroup from "./RadioGroup";
import Select from "./Select";

export const Input = { NumberField, NumberCounterField, CheckboxGroup };
export const Radio = { Vertical };

const FormElements = { RadioGroup, Select, Checkbox, CheckboxWithTooltip, CheckboxNested };
export default FormElements;
