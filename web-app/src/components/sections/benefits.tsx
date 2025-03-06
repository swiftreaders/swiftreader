import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef } from "react";
import "swiper/css";

// Card Component with SwiperSlide inside it
interface CardProps {
  title: string;
  description: string;
  backgroundClass: string;
  scale: number; // New prop to scale the cards
}

const Card: React.FC<CardProps> = ({ title, description, backgroundClass, scale }) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-md text-white ${backgroundClass} min-h-[160px] flex flex-col justify-between`}
      style={{ transform: `scale(${scale})`, transition: "transform 0.3s ease" }}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="flex-grow">{description}</p>
    </div>
  );
};

const Benefits = () => {
  const swiperRef = useRef<any>(null);

  return (
    <section className="h-sr-screen py-[5%] px-[5%] flex items-center justify-center">
      <div className="h-full bg-background rounded-2xl mx-5 md:mx-20 shadow-lg relative flex items-center justify-center">
        {/* Left Chevron */}
        <ChevronLeftIcon
          className="absolute left-4 w-8 h-8 cursor-pointer"
          onClick={() => swiperRef.current?.slidePrev()}
        />

        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">The Benefits of Speed Reading</h2>
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            spaceBetween={30}
            slidesPerView={3}
            loop
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            centeredSlides
            className="md:w-4/5 mx-auto"
          >
            <SwiperSlide className="h-full">
              <Card title="Improve Focus" description="Learn techniques that help you concentrate better and filter out distractions." backgroundClass="bg-sr-gradient" scale={0.9} />
            </SwiperSlide>
            <SwiperSlide className="h-full">
              <Card title="Save Time" description="Absorb more information in less time so you can focus on what really matters." backgroundClass="bg-admin-gradient" scale={0.9} />
            </SwiperSlide>
            <SwiperSlide className="h-full">
              <Card title="Expand Your Knowledge" description="Speed reading opens up new worlds of learning by letting you explore more content quickly." backgroundClass="bg-sr-gradient" scale={0.9} />
            </SwiperSlide>
            <SwiperSlide className="h-full">
              <Card title="Increase Productivity" description="Maximize your reading efficiency and get more done in less time." backgroundClass="bg-admin-gradient" scale={0.9} />
            </SwiperSlide>
            <SwiperSlide className="h-full">
              <Card title="Enhance Retention" description="Retain more of what you read and recall it quickly when needed." backgroundClass="bg-sr-gradient" scale={0.9} />
            </SwiperSlide>
            <SwiperSlide className="h-full">
              <Card title="Boost Mental Agility" description="Sharpen your mind by practicing speed reading, improving both speed and cognitive function." backgroundClass="bg-admin-gradient" scale={0.9} />
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Right Chevron */}
        <ChevronRightIcon
          className="absolute right-4 w-8 h-8 cursor-pointer"
          onClick={() => swiperRef.current?.slideNext()}
        />
      </div>
    </section>
  );
};

export default Benefits;
