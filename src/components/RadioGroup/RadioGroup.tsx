import * as React from "react";
import { CheckboxProps, Radio } from "semantic-ui-react";
import bind from "../../decorators/bind";
import { observable } from "mobx";
import { observer } from "mobx-react";

interface IOption {
    label: string;
    value: any;
}

interface IProps {
    options: IOption[];
    onChange: (value: any) => void;
    initialChecked?: any;
    radioClassName?: string;
}

@observer
class RadioGroup extends React.Component<IProps> {
    @observable private checked: any = this.props.initialChecked;

    public render() {
        return this.props.options.map((option, key) => (
            <Radio
                key={key}
                className={this.props.radioClassName}
                {...option}
                checked={this.checked === option.value}
                onClick={this.changeHandler}
            />
        ));
    }

    @bind
    private changeHandler(e: React.MouseEvent, data: CheckboxProps) {
        this.checked = data.value;
        this.props.onChange(data.value);
    }
}

export default RadioGroup;
