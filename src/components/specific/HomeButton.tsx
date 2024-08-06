import { useNavigate } from "react-router-dom";

interface HomeButtonProps {
    color: string;
    bgColor: string;
    text: string
    border?: string
    hover?: string
}

const HomeButton: React.FC<HomeButtonProps> = ({color, bgColor, text, border}) => {
    const navigate = useNavigate();
    return (
        <button className={`min-w-72 ${border} p-4 rounded-lg block ${bgColor} ${color} font-semibold text-lg`} onClick={() => navigate('/signup')}>{text}</button>
    )
}

export default HomeButton;