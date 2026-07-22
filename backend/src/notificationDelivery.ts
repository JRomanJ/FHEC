import type { SupabaseClient } from '@supabase/supabase-js';
import {
    actualizarResultadoEnvio,
    listarNotificacionesBannerParaEnvio,
    type NotificationDeliveryRow,
} from './db/notificaciones.js';

type ChannelResult = 'enviado' | 'no_configurado' | 'destino_invalido' | 'fallido';

const normalizeVenezuelanPhone = (value: string | null) => {
    const digits = String(value ?? '').replace(/\D/g, '');
    if (!digits) return null;
    if (digits.startsWith('58')) return `+${digits}`;
    if (digits.startsWith('0')) return `+58${digits.slice(1)}`;
    return `+58${digits}`;
};

const sendEmail = async (notification: NotificationDeliveryRow): Promise<ChannelResult> => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.NOTIFICATION_FROM_EMAIL?.trim();
    if (!notification.correo_destino) return 'destino_invalido';
    if (!apiKey || !from) return 'no_configurado';

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from,
                to: [notification.correo_destino],
                subject: notification.titulo,
                text: notification.mensaje,
            }),
        });
        return response.ok ? 'enviado' : 'fallido';
    } catch {
        return 'fallido';
    }
};

const sendSms = async (notification: NotificationDeliveryRow): Promise<ChannelResult> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const from = process.env.TWILIO_FROM_NUMBER?.trim();
    const to = normalizeVenezuelanPhone(notification.telefono_destino);
    if (!to) return 'destino_invalido';
    if (!accountSid || !authToken || !from) return 'no_configurado';

    try {
        const form = new URLSearchParams({ From: from, To: to, Body: `${notification.titulo}\n${notification.mensaje}` });
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form,
        });
        return response.ok ? 'enviado' : 'fallido';
    } catch {
        return 'fallido';
    }
};

export const enviarNotificacionesBanner = async (adminDb: SupabaseClient, idBanner: number) => {
    const notifications = await listarNotificacionesBannerParaEnvio(adminDb, idBanner);
    const summary = { registradas: notifications.length, correoEnviado: 0, smsEnviado: 0, fallos: 0 };

    await Promise.all(notifications.map(async (notification) => {
        const estado: Record<string, string> = { ...notification.estado_envio, in_app: 'enviado' };
        const sent = new Set(notification.canales_enviados.length ? notification.canales_enviados : ['in_app']);
        const jobs: Promise<void>[] = [];

        if (notification.canales_solicitados.includes('correo') && !sent.has('correo')) {
            jobs.push(sendEmail(notification).then((result) => {
                estado.correo = result;
                if (result === 'enviado') { sent.add('correo'); summary.correoEnviado += 1; }
                else if (result === 'fallido' || result === 'destino_invalido') summary.fallos += 1;
            }));
        }
        if (notification.canales_solicitados.includes('sms') && !sent.has('sms')) {
            jobs.push(sendSms(notification).then((result) => {
                estado.sms = result;
                if (result === 'enviado') { sent.add('sms'); summary.smsEnviado += 1; }
                else if (result === 'fallido' || result === 'destino_invalido') summary.fallos += 1;
            }));
        }

        await Promise.all(jobs);
        await actualizarResultadoEnvio(adminDb, notification.id_notificacion, [...sent], estado);
    }));

    return summary;
};
