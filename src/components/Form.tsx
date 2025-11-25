"use client";

import React, { useState, useRef } from "react";
import Stepper, { Step, StepperRef } from "./UI/Stepper";

export default function MultiStepForm() {
  const stepperRef = useRef<StepperRef>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipoEvento: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    ubicacion: "",
    descripcion: "",
  });
  const [submitResult, setSubmitResult] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => form.append(k, v as string));
    form.append("access_key", "c6231a8e-d8b8-47aa-922d-511aa807e9f5");
    form.append("to", "joacoc-10@hotmail.com");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setSubmitResult(
        data.success
          ? "¡Formulario enviado con éxito!"
          : "Error al enviar el formulario"
      );
      if (data.success && stepperRef.current) {
        stepperRef.current.completeStep(); // Cierra el Stepper
      }
    } catch (e) {
      console.error(e);
      setSubmitResult("Error al enviar el formulario");
    }
  };

  return (
    <Stepper
      ref={stepperRef}
      initialStep={1}
      nextButtonText="Siguiente"
      backButtonText="Atrás"
    >
      {/* Paso 1 */}
      <Step>
        <h2 className="mb-4 text-xl font-bold">Información personal</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
      </Step>

      {/* Paso 2 */}
      <Step>
        <h2 className="mb-4 text-xl font-bold">Detalles del evento</h2>
        <select
          name="tipoEvento"
          value={formData.tipoEvento}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="">Selecciona el tipo de evento</option>
          
            <option value="Bodas">Boda</option>
            <option value="Cumpleaños de 15">Cumpleaños de 15</option>
            <option value="Corporativos">Corporativo</option>
            <option value="Fiestas privadas">Fiestas privada</option>
            <option value="Festivales">Festival</option>
            <option value="Otro">Otro</option>
            
        </select>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="time"
          name="horaInicio"
          value={formData.horaInicio}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="time"
          name="horaFin"
          value={formData.horaFin}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          name="ubicacion"
          placeholder="Ubicación del evento"
          value={formData.ubicacion}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
      </Step>

      {/* Paso 3 */}
      <Step>
        <h2 className="mb-4 text-xl font-bold">Descripción del evento</h2>
        <textarea
          name="descripcion"
          placeholder="Breve descripción"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
      </Step>

      {/* Paso 4 */}
      <Step>
        <h2 className="mb-4 text-xl font-bold">Confirmar información</h2>
        <div className="mb-4 space-y-1 text-sm">
          {Object.entries(formData).map(([k, v]) => (
            <div key={k}>
              <strong>{k}:</strong> {v}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            Solicitar presupuesto
          </button>
        </div>
        {submitResult && <p className="mt-2 text-center">{submitResult}</p>}
      </Step>
    </Stepper>
  );
}
