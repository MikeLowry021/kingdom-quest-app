import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import HowItWorks from '../components/sections/HowItWorks';
import Safety from '../components/sections/Safety';
import ForFamilies from '../components/sections/ForFamilies';
import ForChurches from '../components/sections/ForChurches';
import Pricing from '../components/sections/Pricing';
import FAQ from '../components/sections/FAQ';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/SEO/SEOHead';

const HomePage = () => {
  return (
    <>
      <SEOHead />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Safety />
        <ForFamilies />
        <ForChurches />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
