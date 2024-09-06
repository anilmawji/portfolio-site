import Page from './Page';
import ContactSection from '../components/sections/Contact';
import BioSection from '../components/sections/Bio';

const About = () => {
  return (
    <Page title="About Me" headerId="bio">
      <div className="about_sections">
        <BioSection className="animated_border" />
        <ContactSection className="shadow" />
      </div>
    </Page>
  );
}

export default About;