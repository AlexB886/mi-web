
const startButton = document.getElementById("jarvis-start");
const stopButton = document.getElementById("jarvis-stop");
const statusText = document.getElementById("jarvis-status");
const messageText = document.getElementById("jarvis-message");
const visual = document.querySelector(".visual");

let peer = null;
let microphone = null;
let dataChannel = null;
let remoteAudio = null;
let connecting = false;

function setStatus(status, animation = "") {
  if (statusText) statusText.textContent = status;

  if (visual) {
    visual.classList.remove(
      "jarvis-listening",
      "jarvis-thinking",
      "jarvis-speaking"
    );

    if (animation) visual.classList.add(animation);
  }
}

function showMessage(message) {
  if (messageText) messageText.textContent = message;
}

async function startJarvis() {
  if (connecting || peer) return;

  connecting = true;
  startButton.disabled = true;
  setStatus("JARVIS // CONECTANDO");
  showMessage("Preparando conexión de voz...");

  try {
    // 1. Obtener una credencial temporal de nuestro servidor.
    const tokenResponse = await fetch(
      "http://localhost:3000/api/token"
    );

    if (!tokenResponse.ok) {
      throw new Error("No se pudo obtener la credencial de voz.");
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.value) {
      throw new Error("El servidor no ha devuelto una credencial válida.");
    }

    // 2. Solicitar permiso para utilizar el micrófono.
    microphone = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    // 3. Crear la conexión de voz en tiempo real.
    peer = new RTCPeerConnection();

    remoteAudio = document.createElement("audio");
    remoteAudio.autoplay = true;
    remoteAudio.setAttribute("playsinline", "");
    remoteAudio.style.display = "none";
    document.body.appendChild(remoteAudio);

    peer.ontrack = async (event) => {
      remoteAudio.srcObject = event.streams[0];

      try {
        await remoteAudio.play();
      } catch (error) {
        console.warn("El navegador necesita activar el audio.", error);
      }
    };

    microphone.getTracks().forEach((track) => {
      peer.addTrack(track, microphone);
    });

    // 4. Canal para recibir el estado y los mensajes de JARVIS.
    dataChannel = peer.createDataChannel("oai-events");

    dataChannel.onopen = () => {
      setStatus("JARVIS // ESCUCHANDO", "jarvis-listening");
      showMessage("JARVIS está activo. Habla cuando quieras.");

      // Saludo inicial hablado.
      dataChannel.send(JSON.stringify({
        type: "response.create",
        response: {
          instructions:
            "Saluda brevemente en español y di que estás listo para ayudar a Alex."
        }
      }));
    };

    dataChannel.onmessage = (event) => {
      let data;

      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (data.type) {
        case "input_audio_buffer.speech_started":
          setStatus("JARVIS // ESCUCHANDO", "jarvis-listening");
          break;

        case "input_audio_buffer.speech_stopped":
          setStatus("JARVIS // PROCESANDO", "jarvis-thinking");
          break;

        case "response.created":
          setStatus("JARVIS // PENSANDO", "jarvis-thinking");
          break;

        case "output_audio_buffer.started":
          setStatus("JARVIS // HABLANDO", "jarvis-speaking");
          break;

        case "output_audio_buffer.stopped":
        case "response.done":
          setStatus("JARVIS // ESCUCHANDO", "jarvis-listening");
          break;

        case "conversation.item.input_audio_transcription.completed":
          if (data.transcript) {
            showMessage("Tú: " + data.transcript);
          }
          break;

        case "response.output_audio_transcript.done":
          if (data.transcript) {
            showMessage("JARVIS: " + data.transcript);
          }
          break;

        case "error":
          console.error("Error de JARVIS:", data.error);
          showMessage(
            "Ha ocurrido un error en la conversación. Consulta la consola."
          );
          break;
      }
    };

    dataChannel.onerror = () => {
      console.error("Error en el canal de datos de JARVIS.");
    };

    // 5. Negociar la conexión WebRTC con OpenAI.
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const sdpResponse = await fetch(
      "https://api.openai.com/v1/realtime/calls",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.value}`,
          "Content-Type": "application/sdp"
        },
        body: offer.sdp
      }
    );

    if (!sdpResponse.ok) {
      throw new Error(
        "OpenAI rechazó la conexión de voz (HTTP " +
        sdpResponse.status + ")."
      );
    }

    const answerSdp = await sdpResponse.text();

    await peer.setRemoteDescription({
      type: "answer",
      sdp: answerSdp
    });

  } catch (error) {
    console.error("Error al activar JARVIS:", error);

    showMessage(
      "No se pudo activar JARVIS: " + error.message
    );

    stopJarvis(false);
  } finally {
    connecting = false;
    startButton.disabled = false;
  }
}

function stopJarvis(updateMessage = true) {
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }

  if (peer) {
    peer.close();
    peer = null;
  }

  if (microphone) {
    microphone.getTracks().forEach((track) => track.stop());
    microphone = null;
  }

  if (remoteAudio) {
    remoteAudio.pause();
    remoteAudio.srcObject = null;
    remoteAudio.remove();
    remoteAudio = null;
  }

  setStatus("JARVIS // EN ESPERA");

  if (updateMessage) {
    showMessage("JARVIS está desconectado. Actívalo cuando quieras.");
  }

  if (startButton) startButton.disabled = false;
}

startButton?.addEventListener("click", startJarvis);
stopButton?.addEventListener("click", () => stopJarvis());
