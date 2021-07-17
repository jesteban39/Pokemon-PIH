import { Link } from "react-router-dom";
import { fillAll, fillTypes } from "../actions";
import { useDispatch, useSelector } from "react-redux";
import "./styles/landingPage.css";
export default function LandingPage() {
  const countTypes = useSelector((state) => state.typeNames.length);
  const total = useSelector((state) => state.count);
  const dispatch = useDispatch();

  return (
    <div className="landingPage">
      <p className="welcome">Welcome, on this website you will find a list of all existing pokemons, you can see any of them in detail, you can also filter and order them according to the criteria you choose and you can even create your own custom pokemons.</p>
      <Link to="/home">
        <button className="landingButton">To List Pokemons</button>
      </Link>
    </div>
  );
}
