import DevScribbleLogoImg from "../assets/dev-scribble-logo.png";
import "../styles/DevScribbleLogo.css";

const DevScribbleLogo = () => {
    return (
        <div className="logoWrapper">
            <img
                src={DevScribbleLogoImg}
                alt="dev-scribble-logo"
                className="logoImage"
                title="DevScribble Realtime collaboration | Dev & Draw"
            />
            <div className="logoTextWrapper">
                <div className="logoText">DevScribble</div>
                <div className="logoTagLine">
                    Realtime collaboration | Dev & Draw
                </div>
            </div>
        </div>
    );
};

export default DevScribbleLogo;
