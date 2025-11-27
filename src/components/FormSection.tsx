// components/FormSection.tsx
"use client";

import { useState, useRef } from "react";
import MultiStepForm from "./Form";
import ScrollFloat from "./UI/ScrollFloat";

export default function FormSection() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleShowForm = () => {
    setIsFormVisible(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section
      ref={formRef}
      id="FormSection"
      className="relative flex flex-col items-center p-12 mb-24 text-center rounded-xl"
    >
   
      <ScrollFloat>
        <h2 className="mb-4 text-2xl font-bold text-white-fp-300 md:text-3xl font-electrolize">
          ¿Tienes dudas sobre cómo planificar tu evento?
        </h2>
        <p className="max-w-xl mx-auto mb-6 text-slate-300 font-inter">
          Tranquilo, nuestro equipo te asesora para que tu evento sea
          inolvidable. Completa el formulario y obtén un presupuesto
          personalizado sin compromiso.
        </p>

        {!isFormVisible && (
          <button
            onClick={handleShowForm}
            className="px-8 py-3 font-bold tracking-wider uppercase transition duration-300 rounded-lg shadow-lg bg-red-fp-600 text-white-fp-200 hover:bg-red-fp-700 font-electrolize"
          >
            Solicitar presupuesto
          </button>
        )}
      </ScrollFloat>

      {isFormVisible && (
        <div className="w-full max-w-3xl mt-24">
          <MultiStepForm />
        </div>
      )}
    </section>
  );
}
