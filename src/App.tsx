import { Nav } from "./components/Nav";
import { Hero } from "./sections/Hero";
import { Atlas } from "./sections/Atlas";
import { Trends } from "./sections/Trends";
import { Models } from "./sections/Models";
import { Simulator } from "./sections/Simulator";
import { Footer, Method } from "./sections/Method";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Atlas />
        <Trends />
        <Models />
        <Simulator />
        <Method />
      </main>
      <Footer />
    </>
  );
}
