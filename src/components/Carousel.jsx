import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import styles from './Carousel.module.css';

const Carousel = ({
  images,
  showPagination = true,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 0,
}) => {
  return (
    <div className={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={styles.carouselContainer}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className={styles.swiperWrapper}
        >
          <Swiper
            spaceBetween={spaceBetween}
            autoplay={
              autoplay
                ? { delay: 1500, disableOnInteraction: true }
                : false
            }
            effect="coverflow"
            grabCursor={true}
            slidesPerView="auto"
            centeredSlides={true}
            loop={loop}
            coverflowEffect={{
              rotate: 40,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={
              showPagination
                ? { clickable: true }
                : false
            }
            navigation={
              showNavigation
                ? {
                    nextEl: `.${styles.navNext}`,
                    prevEl: `.${styles.navPrev}`,
                  }
                : false
            }
            className={styles.Carousal_003}
            modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className={styles.slideContent}>
                  <img
                    className={styles.image}
                    src={image.src}
                    alt={image.alt}
                  />
                  {image.title && (
                    <div className={styles.slideOverlay}>
                      <h3 className={styles.slideTitle}>{image.title}</h3>
                      <p className={styles.slideDesc}>{image.description}</p>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
            {showNavigation && (
              <>
                <div className={styles.navNext}>
                  <ChevronRightIcon className={styles.navIcon} />
                </div>
                <div className={styles.navPrev}>
                  <ChevronLeftIcon className={styles.navIcon} />
                </div>
              </>
            )}
          </Swiper>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Carousel;
