#High8

DHBW Project - "Mampf" with MobileAngularUI

##Model Service Usage

###Schema

```js
this.model = {
    identity: {
      phone: "",		    // as String
      md5: ""
    },
    contacts: [{
      name: "",
      phone: "",		    // as String
      md5: ""  
    }],
    requests: [{
      currentPosition: {
        longitude: 0,
        latitude: 0,
      },
      invitees: [],        // as MD5
      timeslots: [{
        startTime: "",	 // as EPOCH
        endTime: ""		// as EPOCH
      }],
      response: {
        subjects: [], 	 // as MD5
        timeslots: {
          startTime: "",   // as EPOCH
          endTime: ""	  // as EPOCH
        },
      },
    }],
  };
```

###Funktionen

```
this.delContacts()
```

- leert den Kontakte-Array

```
this.addContact(name, phone)
```

- fügt Kontakt basierend auf Name + Tel. hinzu
- phone als unique identifier

```
this.getContactByPhone(phone) bzw. this.getContactByMD5(md5)
```

- liefert das Kontakt-Objekt zurück wenn es gefunden werden kann, ansonsten undefined

```
this.remContact(contact);
```

- löscht den angegebenen Kontakt (muss genau das Objekt sein)

```
this.setIdentity(phone)
```

- ändert unsere Tel. + erzeugt MD5

```
this.setPosition(position)
```

- setzt die Position für den aktuellen Request

```
this.addInvitee(contact)
```

- fügt den Kontakt den Eingeladenen des aktuellen Requests hinzu (muss genau das Objekt sein)

```
this.remInvitee(contact)
```

- löscht ihn wieder (muss genau das Objekt sein)

```
this.delInvitees()
```

- leert den Array der Eingeladenen

```
this.addTimeslot(timeslot) / this.remTimeslot(timeslot) / this.delTimeslots()
```

- das Gleiche für timeslots des aktuellen Requests
- muss nicht genau das Timeslot Objekt sein (identische Zeiten reichen)

```
this.getMampfAPIRequest(index)
```

- liefert config Objekt das für die Mampf API passt zurück
- index spezifiziert position im model.requests array
- index = -1 greift auf den aktuellsten request zu

```
this.setResponse(index, response)
```

- im callback des findMatches aufrufen und index des requests angeben + response

```
this.newRequest()
```

- "archiviert" den aktuellen request und erzeugt einen neuen als Klon
- response wird null gesetzt
- im callback des findMatches als letztes aufrufen
