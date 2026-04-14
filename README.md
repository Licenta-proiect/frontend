# 💻 USV Recovery Manager - Frontend (Next.js)

Acesta este interfața utilizator (UI) a sistemului de gestionare a recuperărilor didactice. Aplicația este construită pentru a oferi o experiență fluidă și responsivă, permițând profesorilor să identifice rapid sloturi libere, studenților să găsească sloturi alternative pentru activitățile la care nu pot să participe și administratorilor să planifice evenimente universitare/externe.

---

## 🛠️ Stack Tehnologic și Motivație

Alegerea bibliotecilor a fost concentrată pe viteză, tipizare strictă și un design modern:

* **Next.js (App Router):** Ales pentru capabilitățile de Server-Side Rendering (SSR) și Routing optimizat. Versiunea 16.x (Turbopack) asigură timpi de compilare extrem de rapizi.
* **TypeScript:** Utilizat pentru a garanta siguranța tipurilor de date, reducând erorile în faza de execuție, în special la interacțiunea cu API-ul complex de backend.
* **Tailwind CSS & Shadcn/UI:** Pentru un design minimalist, accesibil și complet customizabil. Shadcn/UI oferă componente de înaltă calitate (Dialogs, Popovers, Command Menus) care respectă standardele WAI-ARIA.
* **Lucide React:** Setul de iconițe vectoriale utilizat pentru o interfață intuitivă.
* **Date-fns:** Biblioteca principală pentru manipularea și formatarea datelor calendaristice, crucială pentru logica de recuperări.

---

## 🏗️ Arhitectura Proiectului (src/)

Structura este organizată modular pentru a asigura mentenanța ușoară:

* **app/:** Conține paginile aplicației și logica de routing (Next.js App Router).
* **components/:** Organizat pe responsabilități:
    * **admin/:** Componente specifice panoului de control (Management utilizatori, Sincronizare).
    * **professor/:** Formulare de rezervare, tabele de orar și carduri de status.
    * **student/:** Interfața de căutare și vizualizare a orarului.
    * **ui/:** Componentele de bază (butoane, input-uri, carduri) refolosibile.
* **services/:** `api.ts` centralizează toate apelurile către backend, utilizând Axios pentru gestionarea token-urilor JWT.
* **lib/:** Conține funcții utilitare (ex: `utils.ts` pentru fuzionarea claselor Tailwind).

---

## 🔐 Fluxul de Autentificare și Securitate

Aplicația implementează un flux de securitate în mai mulți pași:

1.  **Login Google:** Utilizatorul este redirecționat către API-ul de backend pentru OAuth2.
2.  **Callback:** Pagina `/callback` preia parametrii de sesiune și verifică dacă este necesar 2FA.
3.  **2FA Verification:** Dacă utilizatorul este Profesor sau Admin, este redirecționat către `/verify-2fa`, unde trebuie să introducă codul primit prin email.
4.  **Gestionarea Sesiunii:** Token-urile JWT sunt stocate securizat și trimise în header-ul `Authorization` la fiecare cerere API.

---

## 📋 Funcționalități pe Roluri

### 👨‍🏫 Interfața Profesor (/profesor)
* **Vizualizare Orar:** Afișează orele oficiale și recuperările deja aprobate.
* **Căutare Sloturi:** Un formular complex care trimite cereri către Solver-ul de backend pentru a găsi intervale libere bazate pe: sala dorită, grupa de studenți și săptămâna selectată.
* **Management Rezervări:** Posibilitatea de a anula cererile pending sau de a vizualiza istoricul.

### 🎓 Interfața Student (/student)
* **Căutare Rapidă:** Studentul își poate selecta facultatea, anul și grupa pentru a vedea orarul zilei curente.
* **Calendar de Recuperări:** O secțiune dedicată care evidențiază orele recuperate, marcate distinct față de orarul standard.

### ⚙️ Panoul de Administrator (/admin)
* **Management Utilizatori:** Interfață pentru editarea rolurilor, ștergerea conturilor sau adăugarea de noi profesori.
* **Sincronizare Orar:** Butoane pentru declanșarea scraper-ului de backend (Facultăți, Săli, Profesori, Orar).
* **Monitorizare Sistem:** Vizualizarea log-urilor de sincronizare și a stării backup-urilor.
* **Solicitări Acces:** Gestionarea cererilor venite de la profesori care nu sunt încă în baza de date.

---

## 📡 Interacțiunea cu API-ul

Toate comunicările se realizează prin `src/services/api.ts`.

* **Base URL:** Configurat prin variabile de mediu (`NEXT_PUBLIC_API_URL`).
* **Interceptors:** Interceptează erorile de tip 401 (neautorizat) pentru a redirecționa utilizatorul automat la pagina de login.