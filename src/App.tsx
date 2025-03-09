import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Connexion à Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker enregistré'))
      .catch(err => console.log('Erreur Service Worker', err));
  });
}

// Liste des mois
const months = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Fonction pour générer un calendrier dynamique
const generateCalendar = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Jour de début (0=Dim, 6=Sam)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Nombre de jours

  let days = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(2); // Mars par défaut
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // État pour stocker l'événement cliqué
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // État pour afficher/fermer la modale d'ajout
  const [newEvent, setNewEvent] = useState({
    date: '',
    name: '',
    description: '',
    promo: '',
    category: '',
    lien: ''
  });

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase.from("events").select("*");
      if (error) console.error(error);
      else setEvents(data);
    }
    fetchEvents();
  }, []);

  const days = generateCalendar(2025, currentMonth);

  const addEvent = async () => {
    try {
      const eventToInsert = { 
        name: newEvent.name, 
        date: newEvent.date, 
        description: newEvent.description, 
        promo: newEvent.promo, 
        categorie: newEvent.category, // Vérifie bien le nom dans ta base
        lien: newEvent.lien 
      };
  
      const { data, error } = await supabase.from("events").insert([eventToInsert]).select();
  
      if (error) {
        console.error("Erreur lors de l'ajout :", error.message);
        return;
      }
  
      if (data && data.length > 0) {
        setEvents([...events, data[0]]); // Ajoute à la liste locale
        setIsAddModalOpen(false); // Ferme la modale
        setNewEvent({ date: "", name: "", description: "", promo: "", category: "", lien: "" }); // Réinitialise le formulaire
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement :", error);
    }
  };  

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteEvent = async (id: number) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
  
      if (error) {
        console.error("Erreur lors de la suppression :", error.message);
        return;
      }
  
      // Mettre à jour l'état local après suppression
      setEvents(events.filter(event => event.id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement :", error);
    }
  };
  

  // Fonction pour gérer les changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-start bg-black text-white p-4">
      {/* Header avec les boutons */}
      <header className="w-full flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-center absolute left-1/2 transform -translate-x-1/2">
        Événements 2025 - Montréal
      </h1>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
          >
            Ajouter
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
          >
            Supprimer
          </button>
        </div>
      </header>

      {/* Boutons des mois */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {months.map((month, index) => (
          <button
            key={index}
            onClick={() => setCurrentMonth(index)}
            className={`px-3 py-2 text-sm font-semibold rounded-lg ${
              currentMonth === index ? "bg-purple-500 text-black" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Calendrier */}
      <div className="w-full max-w-6xl grid grid-cols-7 gap-2 bg-gray-900 p-4 rounded-lg">
        {/* Jours de la semaine */}
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
          <div key={day} className="text-center font-bold py-2">{day}</div>
        ))}

        {/* Cases du calendrier */}
        {days.map((day, index) => {
          const eventForDay = events.find((event) => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === 2025 &&
                   eventDate.getMonth() === currentMonth &&
                   eventDate.getDate() === day;
          });

          return (
            <div
              key={index}
              className="h-32 border flex flex-col items-start p-2 bg-gray-800 rounded-lg text-lg font-semibold relative">
              <span>{day || ""}</span>
              {eventForDay && (
                <button
                  onClick={() => setSelectedEvent(eventForDay)} // Clic pour ouvrir la modale
                  className="mt-2 px-2 py-1 text-sm bg-purple-400 text-black rounded-lg hover:bg-purple-500"
                >
                  {eventForDay.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modale d'affichage des détails */}
      {selectedEvent && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-purple-200 text-black p-6 rounded-lg shadow-lg max-w-lg relative">
            <h2 className="text-2xl font-bold mb-2">{selectedEvent.name}</h2>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            {selectedEvent.promo && (
              <p><strong>Promo:</strong> {selectedEvent.promo}%</p>
            )}
            {selectedEvent.lien && (
              <p>
                <strong>Lien:</strong>{" "}
                <a href={selectedEvent.lien} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {selectedEvent.lien}
                </a>
              </p>
            )}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-2 right-2 text-2xl font-bold text-black border-none bg-transparent"
            >
              <span style={{ color: 'black' }}>⤫</span>
            </button>
          </div>
        </div>
      )}

      {/* Modale d'ajout d'événement */}
      {isAddModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-purple-200 text-black p-6 rounded-lg shadow-lg max-w-lg relative">
            <h2 className="text-2xl font-bold mb-4">Ajouter un Événement</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addEvent();
              }}
              className="space-y-4"
            >
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-800 text-white"
              />
              <input
                type="text"
                name="name"
                placeholder="Nom de l'événement"
                value={newEvent.name}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-800 text-white"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newEvent.description}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-800 text-white"
              />
              <input
                type="number"
                name="promo"
                placeholder="Promo (%)"
                value={newEvent.promo}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-800 text-white"
              />
              <input
                type="text"
                name="category"
                placeholder="Catégorie"
                value={newEvent.category}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-800 text-white"
              />
              <input
                type="url"
                name="lien"
                placeholder="Lien (facultatif)"
                value={newEvent.lien}
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-gray-800 text-white"
              />
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-purple-200 text-black p-6 rounded-lg shadow-lg max-w-lg relative">
          <h2 className="text-2xl font-bold mb-4">Supprimer un Événement</h2>

          {/* Liste des événements */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {events.map(event => (
              <div 
                key={event.id} 
                className="flex justify-between items-center p-2 bg-gray-800 text-white rounded-lg"
              >
                <span>{event.name} - {new Date(event.date).toLocaleDateString()}</span>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-400"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          {/* Bouton pour annuler */}
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="mt-4 w-full bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-500"
          >
            Annuler
          </button>
        </div>
      </div>
    )}

    </div>
  );
}
