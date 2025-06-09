document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('refundForm');
  const btnCancel = document.getElementById('btnCancel');

  btnCancel.addEventListener('click', () => {
    window.location.href = '/account/purchase';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const order_id = form.order_id.value;
    const reason   = form.reason.value.trim();

    if (!reason) {
      alert('Vui lòng nhập lý do hoàn tiền.');
      return;
    }

    try {
      const res = await fetch('/order/refund', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ order_id, reason })
      });
      const json = await res.json();
      if (json.status === 'success') {
        // show your existing success-modal
        document.querySelector('.modal-trigger').click();
      } else {
        throw new Error();
      }
    } catch (err) {
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
      console.error(err);
    }
  });
});
