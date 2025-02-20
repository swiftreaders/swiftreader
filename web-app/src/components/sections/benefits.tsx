import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"; // Import chevron icons

// Card Component with SwiperSlide inside it
interface CardProps {
  title: string;
  description: string;
  backgroundClass: string;
  scale: number; // New prop to scale the cards
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  backgroundClass,
  scale,
}) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-md text-white ${backgroundClass}`}
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.3s ease",
      }}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

function Benefits() {
  return (
    <section className="h-sr-screen py-[5%] px-[5%] flex items-center justify-center">
      <div className="h-full bg-background rounded-2xl mx-5 p-6 shadow-lg relative flex items-center justify-center">
        <ChevronLeftIcon className="absolute left-4 text-white w-8 h-8 cursor-pointer" />
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            The Benefits of Speed Reading
          </h2>
          <Swiper
            spaceBetween={30}
            slidesPerView={3} // Show 3 slides at a time
            loop
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            centeredSlides
            className="md:w-4/5 mx-auto"
          >
            {/* Middle Card with full scale */}
            <SwiperSlide>
              <Card
                title="Improve Focus"
                description="Learn techniques that help you concentrate better and filter out distractions."
                backgroundClass="bg-sr-gradient"
                scale={1} // Full scale for the middle card
              />
            </SwiperSlide>
            {/* Left Card with smaller scale */}
            <SwiperSlide>
              <Card
                title="Save Time"
                description="Absorb more information in less time so you can focus on what really matters."
                backgroundClass="bg-admin-gradient"
                scale={0.9} // Slightly smaller scale for the left card
              />
            </SwiperSlide>
            {/* Right Card with smaller scale */}
            <SwiperSlide>
              <Card
                title="Expand Your Knowledge"
                description="Speed reading opens up new worlds of learning by letting you explore more content quickly."
                backgroundClass="bg-sr-gradient"
                scale={0.9} // Slightly smaller scale for the right card
              />
            </SwiperSlide>
            <SwiperSlide>
              <Card
                title="Increase Productivity"
                description="Maximize your reading efficiency and get more done in less time."
                backgroundClass="bg-admin-gradient"
                scale={0.9} // Slightly smaller scale for the left card
              />
            </SwiperSlide>
            <SwiperSlide>
              <Card
                title="Enhance Retention"
                description="Retain more of what you read and recall it quickly when needed."
                backgroundClass="bg-sr-gradient"
                scale={0.9} // Slightly smaller scale for the right card
              />
            </SwiperSlide>
            <SwiperSlide>
              <Card
                title="Boost Mental Agility"
                description="Sharpen your mind by practicing speed reading, improving both speed and cognitive function."
                backgroundClass="bg-admin-gradient"
                scale={0.9} // Slightly smaller scale for the left card
              />
            </SwiperSlide>
          </Swiper>
        </div>
        <ChevronRightIcon className="absolute right-4 text-white w-8 h-8 cursor-pointer" />
      </div>
    </section>
  );
}

export default Benefits;
