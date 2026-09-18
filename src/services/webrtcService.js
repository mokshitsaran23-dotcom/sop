import DailyIframe from '@daily-co/daily-js';

class WebRTCService {
  constructor() {
    this.callObject = null;
    this.roomUrl = null;
    this.isMuted = false;
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onNetworkQualityChange = null;
    this.broadcastChannel = null;
    this.channelName = null;
    this.onRemoteDataCallback = null;
  }

  // Initialize a Daily.co call object if Daily URL is provided
  async createDailyCallObject(roomUrl, callbacks = {}) {
    this.roomUrl = roomUrl;
    if (this.callObject) {
      await this.leaveCall();
    }

    try {
      this.callObject = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: false,
      });

      this.callObject
        .on('joined-meeting', (e) => {
          if (callbacks.onJoined) callbacks.onJoined(e);
        })
        .on('participant-joined', (e) => {
          if (callbacks.onParticipantJoined) callbacks.onParticipantJoined(e);
        })
        .on('participant-left', (e) => {
          if (callbacks.onParticipantLeft) callbacks.onParticipantLeft(e);
        })
        .on('error', (e) => {
          console.warn('Daily Call Error:', e);
          if (callbacks.onError) callbacks.onError(e);
        });

      await this.callObject.join({ url: roomUrl });
      return this.callObject;
    } catch (err) {
      console.warn('Daily.co join error (falling back to direct peer channel):', err);
      return null;
    }
  }

  // Cross-tab and local simulated peer channel for zero-config WebRTC data sync
  initPeerChannel(roomId, onRemoteData) {
    this.channelName = `vocalease_room_${roomId}`;
    this.onRemoteDataCallback = onRemoteData;

    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        if (this.broadcastChannel) {
          this.broadcastChannel.close();
        }
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          if (this.onRemoteDataCallback && event.data) {
            this.onRemoteDataCallback(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }
  }

  // Send message or caption over peer channel to connected peer
  sendPeerData(type, payload) {
    if (this.broadcastChannel) {
      try {
        const cleanPayload = JSON.parse(JSON.stringify(payload));
        this.broadcastChannel.postMessage({
          type,
          payload: cleanPayload,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('Failed to post peer data:', err);
      }
    }
  }

  toggleMicrophone() {
    this.isMuted = !this.isMuted;
    if (this.callObject) {
      this.callObject.setLocalAudio(!this.isMuted);
    }
    return this.isMuted;
  }

  setMicrophone(enabled) {
    this.isMuted = !enabled;
    if (this.callObject) {
      this.callObject.setLocalAudio(enabled);
    }
    return this.isMuted;
  }

  async leaveCall() {
    if (this.callObject) {
      try {
        await this.callObject.leave();
        this.callObject.destroy();
      } catch {
        // ignore leave error
      }
      this.callObject = null;
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore close error
      }
      this.broadcastChannel = null;
    }
  }
}

export const webrtcService = new WebRTCService();
