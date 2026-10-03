import { FaEnvelope, FaGithub, FaLinkedin, FaPhoneAlt, FaYoutube } from "react-icons/fa";

function Contact() {
  return (
    <section id="contact" className="section-wrap animate-fadeInUp">
      <p className="section-badge">Raven Network</p>
      <h3 className="section-title">Contact & Socials</h3>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:sarthakjainbajaj@gmail.com"
          className="glass-card inline-flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-md"
        >
          <FaEnvelope />
          sarthakjainbajaj@gmail.com
        </a>
        <a
          href="tel:+919131255449"
          className="glass-card inline-flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-md"
        >
          <FaPhoneAlt />
          +91-9131255449
        </a>
        <a
          href="https://www.linkedin.com/in/sarthak-jain-bajaj-2550a63a2"
          target="_blank"
          rel="noreferrer"
          className="glass-card inline-flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-md"
        >
          <FaLinkedin />
          LinkedIn
        </a>
        <a
          href="https://github.com/sarthakjainbajaj-hash"
          target="_blank"
          rel="noreferrer"
          className="glass-card inline-flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-md"
        >
          <FaGithub />
          GitHub
        </a>
        <a
          href="https://youtube.com/shorts/jX8gRQwBRoM?si=p8qPG7VvSyc3jYxx"
          target="_blank"
          rel="noreferrer"
          className="glass-card inline-flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-md text-red-400 sm:col-span-2"
        >
          <FaYoutube className="text-xl text-red-500" />
          <span>YouTube Channel — AI Video Content Creator</span>
        </a>
      </div>
    </section>
  );
}

export default Contact;
