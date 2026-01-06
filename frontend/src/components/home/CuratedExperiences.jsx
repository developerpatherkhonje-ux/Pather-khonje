import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ExperienceCard = ({
  index,
  title,
  description,
  image,
  align = "left",
  linkText,
}) => {
  return (
    <div
      className={`flex flex-col lg:flex-row ${
        align === "right" ? "lg:flex-row-reverse" : ""
      } w-full min-h-[550px]`}
    >
      <div
        className={`flex flex-col lg:flex-row ${
          align === "right" ? "lg:flex-row-reverse" : ""
        } w-full min-h-[550px]`}
      >
        {/* Image Side - Editorial Scale In */}
        <div className="w-full lg:w-1/2 overflow-hidden relative group">
          <motion.div
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Content Side - Precise Stagger */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 py-16 bg-ice-blue"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-serif text-sm text-slate-400 mb-4 block"
          >
            0{index + 1}
          </motion.span>

          <motion.h3
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-serif text-3xl lg:text-4xl text-midnight-ocean mb-6 leading-tight"
          >
            {title}
          </motion.h3>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="font-sans text-slate-gray text-base leading-relaxed mb-8 max-w-md"
          >
            {description}
          </motion.p>

          <motion.button
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="flex items-center gap-2 font-sans font-bold text-midnight-ocean text-xs uppercase tracking-widest group cursor-pointer hover:text-deep-steel-blue transition-colors"
          >
            {linkText}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const CuratedExperiences = () => {
  const experiences = [
    {
      title: "Heritage & History",
      description:
        "Walk through the corridors of time. From the Mughal gardens of Kashmir to the colonial charm of Kolkata, we open doors to India's most storied pasts.",
      image:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop",
      linkText: "View Heritage Trips",
    },
    {
      title: "Nature & Wild",
      description:
        "Immerse yourself in the untamed. Private safaris in Ranthambore, silent boat rides in the Sunderbans, and stargazing in Spiti Valley.",
      image:
        "https://images.unsplash.com/photo-1504705759706-c5ee7158f8bb?q=80&w=2070&auto=format&fit=crop",
      linkText: "View Nature Trips",
    },
    {
      title: "Retreat & Restore",
      description:
        "Find your center. Curated wellness retreats in the Himalayas and coastal sanctuaries designed for deep rest and rejuvenation.",
      image:
        "https://images.unsplash.com/photo-1507725914440-e1e434774828?q=80&w=2000&auto=format&fit=crop",
      linkText: "View Wellness Trips",
    },
  ];

  return (
    <section className="w-full">
      <div className="py-20 bg-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="font-sans text-[10px] font-bold text-slate-gray uppercase tracking-[0.2em] mb-3 block">
            The Collection
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl text-midnight-ocean">
            Curated Experiences
          </h2>
        </motion.div>
      </div>

      <div className="flex flex-col">
        {experiences.map((exp, index) => (
          <ExperienceCard
            key={index}
            index={index}
            title={exp.title}
            description={exp.description}
            image={exp.image}
            align={index % 2 !== 0 ? "right" : "left"}
            linkText={exp.linkText}
          />
        ))}
      </div>
    </section>
  );
};

export default CuratedExperiences;
