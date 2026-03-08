import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Plays an MP3 file in a voice channel
 * @param {object} voiceChannel - The voice channel to join
 * @param {string} soundName - The name of the sound (without .mp3 extension)
 * @returns {Promise<void>}
 */
export async function playSound(voiceChannel, soundName) {
    const soundPath = join(__dirname, '..', 'sounds', `${soundName}.mp3`);

    if (!existsSync(soundPath)) {
        throw new Error(`Sound "${soundName}" not found.`);
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
    } catch (error) {
        console.error('Voice connection failed to become ready:', error);
        connection.destroy();
        throw new Error('Failed to connect to the voice channel (network timeout).');
    }

    const player = createAudioPlayer();
    const resource = createAudioResource(soundPath);

    player.play(resource);
    connection.subscribe(player);

    return new Promise((resolve, reject) => {
        player.on(AudioPlayerStatus.Idle, () => {
            resolve();
            // Wait 2 minutes (120,000ms) before leaving the channel
            setTimeout(() => {
                // Check if connection is still active and hasn't been destroyed manually or played another sound
                if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    connection.destroy();
                }
            }, 120_000);
        });

        player.on('error', error => {
            console.error('Error playing sound:', error.message);
            connection.destroy();
            reject(error);
        });
    });
}
