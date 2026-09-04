import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_session');
  const storedPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10));
  const searchQuery = resolvedSearchParams.search || '';
  const pageSize = 5;

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

  // Handle Order Status & Tracking Updates
  async function updateOrder(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const newStatus = formData.get('status') as string;
    const trackingNumber = formData.get('trackingNumber') as string;
    const estimatedDelivery = formData.get('estimatedDelivery') as string;

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: newStatus,
        trackingNumber: trackingNumber ? trackingNumber : null,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/orders');
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

  // Handle Add Product
  async function addProduct(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const priceDollars = parseFloat(formData.get('price') as string || '0');
    const image = formData.get('image') as string;
    const description = formData.get('description') as string;

    await prisma.product.create({
      data: {
        name,
        price: Math.round(priceDollars * 100), // store in cents
        imageUrl: image,
        description,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
  }

  // Handle Update Product
  async function updateProduct(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    const name = formData.get('name') as string;
    const priceDollars = parseFloat(formData.get('price') as string || '0');
    const image = formData.get('image') as string;
    const description = formData.get('description') as string;

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: Math.round(priceDollars * 100),
        imageUrl: image,
        description,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
  }

  // Handle Delete Product
  async function deleteProduct(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin');
    revalidatePath('/');
  }

  // Handle Direct Support Announcement Email
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

  // Database filters for real vs test orders including search query support
  const liveWhere: any = {
    AND: [
      { email: { not: { contains: 'resend.dev' } } },
      { email: { not: { contains: 'example.com' } } },
    ],
  };

  if (searchQuery) {
    liveWhere.AND.push({
      OR: [
        { id: { contains: searchQuery } },
        { fullName: { contains: searchQuery } },
        { email: { contains: searchQuery } },
      ],
    });
  }

  const testWhere = {
    OR: [
      { email: { contains: 'resend.dev' } },
      { email: { contains: 'example.com' } },
    ],
  };

  // Fetch paginated real orders, test orders, and live store products simultaneously
  const [totalLiveOrders, orders, testOrders, products] = await Promise.all([
    prisma.order.count({ where: liveWhere }),
    prisma.order.findMany({
      where: liveWhere,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.findMany({
      where: testWhere,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalLiveOrders / pageSize) || 1;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Store Admin Dashboard</h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '5px 0 0' }}>Manage live customer orders, fulfillment, tracking, and store inventory.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: '#27272a', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}>
              Total Real Orders: <strong>{totalLiveOrders}</strong>
            </div>
            <form action={handleLogout}>
              <button type="submit" style={{ background: '#27272a', color: '#ef4444', border: '1px solid #3f3f46', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Real Orders Table Container */}
        <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden', marginBottom: '30px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', background: '#1f1f23', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Live Customer Orders</span>
              <span style={{ fontSize: '13px', color: '#a1a1aa', marginLeft: '12px' }}>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Quick Search Bar */}
            <form method="GET" style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                name="search" 
                defaultValue={searchQuery} 
                placeholder="Search name, email, ID..." 
                style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', width: '220px' }}
              />
              <button type="submit" style={{ background: '#27272a', color: '#fff', border: '1px solid #3f3f46', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                Search
              </button>
              {searchQuery && (
                <a href="/admin" style={{ background: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Clear
                </a>
              )}
            </form>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#27272a', color: '#a1a1aa', borderBottom: '1px solid #3f3f46' }}>
                <th style={{ padding: '12px 16px' }}>Order ID (Full)</th>
                <th style={{ padding: '12px 16px' }}>Order Date</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Shipping Address</th>
                <th style={{ padding: '12px 16px' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Tracking & Delivery</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#a1a1aa' }}>
                    No matching customer orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const style = getStatusStyle(order.status);
                  const formattedOrderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #27272a' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px', wordBreak: 'break-all', maxWidth: '180px' }}>
                        {order.id}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formattedOrderDate}
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

                      {/* Tracking & Delivery Form Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <form action={updateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="status" value={order.status} />
                          <input 
                            type="text" 
                            name="trackingNumber" 
                            defaultValue={order.trackingNumber || ''} 
                            placeholder="Tracking #" 
                            style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
                          />
                          <input 
  				type="datetime-local" 
  				name="estimatedDelivery" 
  				defaultValue={order.estimatedDelivery ? (() => {
    				const d = new Date(order.estimatedDelivery);
    				const year = d.getFullYear();
    				const month = String(d.getMonth() + 1).padStart(2, '0');
    				const day = String(d.getDate()).padStart(2, '0');
    				const hours = String(d.getHours()).padStart(2, '0');
    				const minutes = String(d.getMinutes()).padStart(2, '0');
    				return `${year}-${month}-${day}T${hours}:${minutes}`;
  				})() : ''} 
  				style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
				/>
                          <button type="submit" style={{ background: '#27272a', color: '#fff', border: '1px solid #3f3f46', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                            Save Tracking
                          </button>
                        </form>
                      </td>

                      {/* Actions Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <form action={updateOrder}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="pending" />
                            <button type="submit" style={{ background: '#27272a', color: '#eab308', border: '1px solid #3f3f46', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                              Pending
                            </button>
                          </form>
                          <form action={updateOrder}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="completed" />
                            <button type="submit" style={{ background: '#27272a', color: '#22c55e', border: '1px solid #3f3f46', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                              Complete
                            </button>
                          </form>
                          <form action={updateOrder}>
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

          {/* Pagination Controls Bar */}
          {totalPages > 1 && (
            <div style={{ padding: '14px 20px', background: '#1f1f23', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <a 
                href={`/admin?page=${currentPage - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`} 
                style={{ 
                  background: currentPage <= 1 ? '#27272a' : '#3f3f46', 
                  color: currentPage <= 1 ? '#71717a' : '#fff', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '13px', 
                  textDecoration: 'none', 
                  pointerEvents: currentPage <= 1 ? 'none' : 'auto' 
                }}
              >
                Previous
              </a>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a 
                  key={p} 
                  href={`/admin?page=${p}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`} 
                  style={{ 
                    background: p === currentPage ? '#fff' : '#27272a', 
                    color: p === currentPage ? '#000' : '#fff', 
                    padding: '6px 10px', 
                    borderRadius: '4px', 
                    fontSize: '13px', 
                    fontWeight: p === currentPage ? 'bold' : 'normal',
                    textDecoration: 'none' 
                  }}
                >
                  {p}
                </a>
              ))}

              <a 
                href={`/admin?page=${currentPage + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`} 
                style={{ 
                  background: currentPage >= totalPages ? '#27272a' : '#3f3f46', 
                  color: currentPage >= totalPages ? '#71717a' : '#fff', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '13px', 
                  textDecoration: 'none', 
                  pointerEvents: currentPage >= totalPages ? 'none' : 'auto' 
                }}
              >
                Next
              </a>
            </div>
          )}
        </div>

        {/* Product Management Section */}
        <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden', marginBottom: '30px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', background: '#1f1f23', fontWeight: 'bold', fontSize: '15px' }}>
            Store Product Catalog Management
          </div>

          {/* Add Product Form */}
          <div style={{ padding: '20px', borderBottom: '1px solid #27272a', background: '#141416' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0' }}>Add New Store Item</h3>
            <form action={addProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input 
                type="text" 
                name="name" 
                placeholder="Product Name" 
                required 
                style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }}
              />
              <input 
                type="number" 
                step="0.01" 
                name="price" 
                placeholder="Price ($)" 
                required 
                style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }}
              />
              <input 
                type="text" 
                name="image" 
                placeholder="Image URL or Path" 
                required 
                style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }}
              />
              <input 
                type="text" 
                name="description" 
                placeholder="Short Description" 
                style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }}
              />
              <button type="submit" style={{ background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', gridColumn: '1 / -1', width: 'fit-content' }}>
                Add Product
              </button>
            </form>
          </div>

          {/* Products List Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#27272a', color: '#a1a1aa', borderBottom: '1px solid #3f3f46' }}>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px' }}>Quick Edit / Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#a1a1aa' }}>
                    No products found in the database.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <form id={`update-form-${product.id}`} action={updateProduct}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="image" value={product.imageUrl || ''} />
                      </form>
                      <input 
                        form={`update-form-${product.id}`}
                        type="text" 
                        name="name" 
                        defaultValue={product.name} 
                        style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', width: '160px' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <input 
                        form={`update-form-${product.id}`}
                        type="number" 
                        step="0.01" 
                        name="price" 
                        defaultValue={(product.price / 100).toFixed(2)} 
                        style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', width: '80px' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <input 
                        form={`update-form-${product.id}`}
                        type="text" 
                        name="description" 
                        defaultValue={product.description || ''} 
                        style={{ background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', width: '200px' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          form={`update-form-${product.id}`}
                          type="submit" 
                          style={{ background: '#27272a', color: '#38bdf8', border: '1px solid #3f3f46', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save
                        </button>
                        <form action={deleteProduct}>
                          <input type="hidden" name="productId" value={product.id} />
                          <button type="submit" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Test / Webhook Simulation Orders Section */}
        {testOrders.length > 0 && (
          <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden', marginBottom: '30px', opacity: 0.85 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', background: '#1f1f23', fontWeight: 'bold', fontSize: '15px', color: '#a1a1aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Test & Webhook Simulation Orders (Resend / Example)</span>
              <span style={{ fontSize: '12px', background: '#27272a', padding: '2px 8px', borderRadius: '4px' }}>{testOrders.length} test(s)</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#27272a', color: '#a1a1aa', borderBottom: '1px solid #3f3f46' }}>
                  <th style={{ padding: '12px 16px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Order Date</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testOrders.map((order: any) => {
                  const style = getStatusStyle(order.status);
                  const formattedOrderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #27272a' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {order.id.slice(-8)}...
                      </td>
                      <td style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formattedOrderDate}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '500' }}>{order.fullName}</div>
                        <div style={{ color: '#a1a1aa', fontSize: '12px' }}>{order.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                        ${(order.amount / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: style.bg, color: style.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <form action={deleteOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                            Delete Test Order
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Direct Support Message Section */}
        <div style={{ background: '#18181b', padding: '24px', borderRadius: '8px', border: '1px solid #27272a', maxWidth: '600px', marginTop: '20px' }}>
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