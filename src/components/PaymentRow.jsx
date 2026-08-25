import { useEffect } from 'react';
import moment from 'moment';
function PaymentRow({ r, status_colors, setPaymentPreviewImage, yesNo, approvePayment, rejectPayment, checkPayment }) {
  useEffect(() => {
    if (r.status === "Aprobado" || r.status === "Pendiente") {
      checkPayment(r);
    }
  }, [r.status]);


  return (
    <tr className="group transition hover:bg-slate-800/40">
      <td className="px-6 py-4 font-medium text-white">{r.client_name}</td>
      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.amount} $</td>
      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
        <span className='font-bold'>{moment(r.payment_date).format('DD-MM-YYYY')}</span>{' '}
        <span className='font-semibold text-customYellow'>{moment(r.payment_date).format('hh:mm a')}</span>
      </td>
      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.payment_method}</td>
      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.period_covered}</td>
      <td className="px-6 py-4">
        {r.receipt_image_url ? (
          <img
            src={r.receipt_image_url}
            alt="comprobante"
            className="h-14 w-20 object-cover rounded-md cursor-pointer hover:opacity-80"
            onClick={() => setPaymentPreviewImage(r.receipt_image_url)}
          />
        ) : (
          <span className="text-slate-500 text-xs">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-slate-800 text-${status_colors[r.status]}`}>
          {r.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className={`flex gap-2 opacity-70 group-hover:opacity-100 ${r.status !== "Pendiente" ? "hidden" : ""} `}>
          <button onClick={() => yesNo('¿Aprobar este comprobante?', () => approvePayment(r.id))} className={`rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-green-800 hover:text-white `}>Aprobar</button>
          <button onClick={() => yesNo('¿Eliminar esta receta?', () => rejectPayment(r.id))} className="rounded-full bg-red-600 hover:bg-red-800 px-4 py-2 text-xs font-semibold text-white">Rechazar</button>
          {/* Ahora el botón es solo un indicador o un disparador manual opcional */}
        </div>
      </td>
    </tr>
  );
}

export default PaymentRow;