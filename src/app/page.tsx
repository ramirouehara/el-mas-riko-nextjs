import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";


const especialidades = [
  {
    src:"https://www.clarin.com/img/2021/09/06/ZUZbnAZNY_1256x620__2.jpg",
    nombre:"Sanguches"
  },
  {
    src:"https://upload.wikimedia.org/wikipedia/commons/9/96/Milanesa_napolitana_con_papas_fritas_rodajas_de_tomate_y_or%C3%A9gano.jpg",
    nombre:"Minutas"
  },
  {
    src:"https://images.getrecipekit.com/20220816143651-1.png?class=16x9",
    nombre:"Empanadas"
  },
  {
    src:"https://i0.wp.com/cremigal.com/wp-content/uploads/2022/04/CREMIGAL-10-scaled.jpg?w=1920&ssl=1",
    nombre:"Pizzas"
  },
  {
    src:"https://www.semanarioextra.com.ar/wp-content/uploads/2022/01/56afe82bc46188be6a8b4606.jpg",
    nombre:"Bebidas"
  }
]


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





      <section id="especialidades" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">NUESTRAS ESPECIALIDADES ❤️❤️❤️</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {especialidades.map((e) => {
              return (
              <div key={e.nombre}>
                <div className="relative h-[300px]">
                  <Image src={e.src} alt={e.nombre} fill className="object-cover"/>
                </div>
                  <h3 className="text-center mt-2 font-semibold">{e.nombre}</h3>
              </div>
              )
            })}

          </div>
        </div>
      </section>


    </>
  );
}
