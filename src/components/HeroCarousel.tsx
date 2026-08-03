"use client"

import { useState } from "react";
import Image from "next/image";

const imagenes = [
    {
     src: "https://imag.bonviveur.com/sandwich-de-milanesa.webp",
     alt: "Sanguche de Milanesa"
    },
    {
     src: "https://www.clarin.com/img/2021/07/26/u-aUfp64d_1256x620__1.jpg",
     alt: "Lomito"
    },
    {
     src: "https://statics.diariomendoza.com.ar/2021/06/crop/61a531b72d9b0__700x430.webp",
     alt: "Milanesa Napolitana"
    }
]

export default function HeroCarousel () {
 const [actual, setActual] = useState(0)

function siguiente() {
        if (actual + 1 >= imagenes.length) {
            setActual(0);
        } else {
            setActual(actual + 1);
        }
    }

function paAtras() {
    if (actual === 0){
        setActual(imagenes.length - 1)
    } else {
        setActual(actual - 1)
    }
}

 return (
    <div className="relative h-[60vh]">
        <Image 
        src={imagenes[actual].src}
        alt={imagenes[actual].alt}
        fill
        className="object-cover"/>
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <h1 className="text-4xl font-bold">Milanesas Que Llenan al Corazon</h1>
            <p>Sanguches de Milanesa, como tienen que ser...</p>
        </div>

        <button onClick={siguiente} className="absolute right-4 top-1/2 -translate-y-1/2">→</button>
        <button onClick={paAtras} className="absolute left-4 top-1/2 -translate-y-1/2">←</button>
    </div>
 )
}