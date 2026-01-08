import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <h1 className="home-title">Sparvi Lab Games</h1>

      <div className="menu">
        <Link to="/panelco" className="menu-btn">8 Games</Link>
        <Link to="/balance-beam" className="menu-btn">Balance Beam Lab</Link>
        <Link to="/mirror-bounce" className="menu-btn">Mirror Bounce Lab</Link>
        <Link to="/circuit-loop" className="menu-btn">Circuit Loop Game</Link>
        <Link to="/fraction-smash" className="menu-btn">Fraction Smash</Link>
        <Link to="/fraction-snake" className="menu-btn">Fraction Snake</Link>
        <Link to="/fraction-garden" className="menu-btn">Fraction Garden</Link>
        <Link to="/matrix-garden" className="menu-btn">Matrix Garden</Link>
        <Link to="/Matrix-Candy-Mixer" className="menu-btn">Matrix-Candy-Mixer</Link>
        <Link to="/Farm-Matrix-Animals" className="menu-btn">Farm-Matrix-Animals</Link>
        <Link to="/MatrixTile-Drop" className="menu-btn">MatrixTileDrop</Link>

      </div>
    </div>
  );
}
