import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_session');
  const storedPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Handle Login
  async function handleLogin(formData: FormData) {
    'use server';
    const passwordInput = formData.get('password') as string;
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (passwordInput === correctPassword) {
      const cookieStoreInstance = await cookies();
      cookieStoreInstance.set('admin_session', correctPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 30, // 30 minutes
      });
    }
    revalidatePath('/admin');
  }

  // Handle Logout
  async function handleLogout() {
    'use server';
    const cookieStoreInstance = await cookies();
    cookieStoreInstance.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    revalidatePath('/admin');
  }

  // Handle Order Status Changes
  async function setStatus(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const newStatus = formData.get('status') as string;

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath('/admin');
  }

  // Handle Order Deletion
  async function deleteOrder(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;

    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath('/admin');
  }

  // Handle Direct Support Announcement Email (Top-level server action)
  async function sendAnnouncement(formData: FormData) {
    'use server';
    const recipient = formData.get('recipient') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
      await resend.emails.send({
        from: 'VELVET Support <onboarding@resend.dev>',
        to: [recipient],
        subject: subject,
        html: `
          <div style="font-family: sans-serif; background: #f4f4f5; padding: 30px; color: #18181b;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e4e4e7;">
              <h2 style="margin-top: 0; color: #09090b; font-size: 20px;">${subject}</h2>
              <p style="font-size: 15px; line-height: 1.5; color: #3f3f46;">${message}</p>
              <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 25px 0;" />
              <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 0;">Sent securely from VELVET contact system.</p>
            </div>
          </div>
        `,
      });
    } catch (error: any) {
      console.error('Failed to send direct email:', error.message);
    }
  }

  // If not authenticated, show password screen
  if (!adminCookie || adminCookie.value !== storedPassword) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <form action={handleLogin} style={{ background: '#18181b', padding: '30px', borderRadius: '8px', border: '1px solid #27272a', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>Admin Login</h2>
          <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '20px' }}>Enter your store password to access controls.</p>
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
            style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px', marginBottom: '15px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  // Fetch orders if authenticated
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Store Admin Dashboard</h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '5px 0 0' }}>Manage live customer orders and fulfillment.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: '#27272a', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}>
              Total Orders: <strong>{orders.length}</strong>
            </div>
            <form action={handleLogout}>
              <button type="submit" style={{ background: '#27272a', color: '#ef4444', border: '1px solid #3f3f46', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#27272a', color: '#a1a1aa', borderBottom: '1px solid #3f3f46' }}>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Shipping Address</th>
                <th style={{ padding: '12px 16px' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#a1a1aa' }}>
                    No orders found yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const style = getStatusStyle(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #27272a' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {order.id.slice(-8)}...
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '500' }}>{order.fullName}</div>
                        <div style={{ color: '#a1a1aa', fontSize: '12px' }}>{order.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: '13px' }}>
                        {order.addressLine}, {order.city} ({order.countryCode})
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                        ${(order.amount / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ 
                          background: style.bg,
                          color: style.color,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <form action={setStatus}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="pending" />
                            <button type="submit" style={{ background: '#27272a', color: '#eab308', border: '1px solid #3f3f46', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                              Pending
                            </button>
                          </form>
                          <form action={setStatus}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="completed" />
                            <button type="submit" style={{ background: '#27272a', color: '#22c55e', border: '1px solid #3f3f46', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                              Complete
                            </button>
                          </form>
                          <form action={setStatus}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <button type="submit" style={{ background: '#27272a', color: '#ef4444', border: '1px solid #3f3f46', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                              Reject
                            </button>
                          </form>
                          <form action={deleteOrder}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <button type="submit" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Direct Support Message Section */}
        <div style={{ background: '#18181b', padding: '24px', borderRadius: '8px', border: '1px solid #27272a', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Send Direct Customer Message</h2>
          <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '20px' }}>Dispatch a support reply or announcement email independently without creating a database order.</p>
          
          <form action={sendAnnouncement} style={{ display: 'grid', gap: '12px' }}>
            <input 
              type="email" 
              name="recipient" 
              placeholder="Customer Email (e.g. user@gmail.com)" 
              required 
              style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px', fontSize: '14px' }}
            />
            <input 
              type="text" 
              name="subject" 
              placeholder="Subject Line" 
              required 
              style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px', fontSize: '14px' }}
            />
            <textarea 
              name="message" 
              placeholder="Type your message here..." 
              rows={4}
              required 
              style={{ padding: '10px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px', fontSize: '14px', fontFamily: 'sans-serif' }}
            />
            <button type="submit" style={{ padding: '10px 16px', background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', width: 'fit-content' }}>
              Send Email
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}