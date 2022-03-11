interface Props {
    foo: number
}

export const Component = (props: Props) => {
    return (
        <div>Comp: {props.foo}</div>
    )
}