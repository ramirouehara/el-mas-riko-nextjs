import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <section id="nosotros" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">

            <div>
              <Image src="/img/sandwich.png" alt="Sanguche de milanesa ElMasRico" width={400} height={400}/>
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">
                LA MILANESA MAS RICA QUE EXISTE
              </h2>
              <p className="leading-relaxed">
                Esta Sangucheria no vende Sanguches de Milanesas, 
                Vende mas que eso, Vende una experiencia, 
                Una Emocion, Un Sentimiento que ninguna 
                sangucheria puede superar. 
                En 2020 se creo esta Sangucheria para poder 
                hacer eso, unir a la gente cuando mas separada 
                estaba, La Milanesa es mas que una Comida, 
                Es una parte del Alma.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
