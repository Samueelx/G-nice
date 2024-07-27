interface HomeButtonProps {
    color: string;
    bgColor: string;
    text: string
    border?: string
    hover?: string
}

const HomeButton: React.FC<HomeButtonProps> = ({color, bgColor, text, border}) => {
    return (
        <button className={`min-w-72 ${border} p-4 rounded-lg block ${bgColor} ${color} font-semibold text-lg`}>{text}</button>
    )
}

export default HomeButton;