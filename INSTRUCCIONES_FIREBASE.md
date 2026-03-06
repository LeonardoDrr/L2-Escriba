# Configuración de Firebase para el Gestor de Avance

## Problema Actual
La app muestra contenido pero **NO GUARDA** porque Firebase está bloqueando las escrituras por seguridad.

## Solución: Configurar Reglas de Firestore

### Paso 1: Ir a la Consola de Firebase
1. Abre tu navegador
2. Ve a: **https://console.firebase.google.com**
3. Haz clic en tu proyecto: **gestor-de-tareas-d8b35**

### Paso 2: Configurar Firestore Database
1. En el menú lateral izquierdo, busca **"Firestore Database"**
2. Si dice "Crear base de datos" (Get Started), haz clic
   - Selecciona "Producción" o "Prueba" (da igual por ahora)
   - Elige la región más cercana (us-central, southamerica-east1, etc.)
   - Haz clic en "Habilitar"

### Paso 3: Cambiar las Reglas de Seguridad
1. Ve a la pestaña **"Reglas"** (Rules)
2. Verás algo como esto:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ← ESTO BLOQUEA TODO
    }
  }
}
```

3. **REEMPLAZA** todo el contenido con esto:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ← ESTO PERMITE TODO (SOLO PARA DESARROLLO)
    }
  }
}
```

4. Haz clic en **"Publicar"** (Publish)

### Paso 4: Verificar
1. Vuelve a la pestaña **"Datos"** (Data)
2. Deberías ver una colección llamada `projects`
3. Recarga tu aplicación (`index.html`)
4. Intenta agregar una tarea

## ⚠️ IMPORTANTE - Seguridad
Las reglas `allow read, write: if true` permiten que **CUALQUIERA** lea y escriba en tu base de datos.

**Solo usar para desarrollo/pruebas**.

Para producción, deberías:
- Activar Firebase Authentication
- Cambiar las reglas a verificar usuarios autenticados

## Si aún no funciona
Abre la Consola del Navegador (F12) y busca errores en rojo. Compártelos aquí.
