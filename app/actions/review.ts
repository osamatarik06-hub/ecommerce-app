'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Adjust this import path if your auth file is located elsewhere (e.g., '@/auth.ts' or '@/lib/auth')
import { revalidatePath } from 'next/cache';

export async function addReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: 'You must be logged in to leave a review.' };
  }

  // Find the user in your Prisma database using their NextAuth email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, message: 'User record not found.' };
  }

  const productId = formData.get('productId') as string;
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment') as string;

  if (!productId || !rating || !comment) {
    return { success: false, message: 'All fields are required.' };
  }

  try {
    await prisma.review.create({
      data: {
        rating,
        comment,
        author: user.fullName,
        userId: user.id,
        productId,
        isApproved: false, // Requires admin approval
      },
    });

    revalidatePath(`/product/${productId}`);
    return { success: true, message: 'Review sent! Waiting for approval.' };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: 'You have already reviewed this product.' };
    }
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

export async function deleteReview(reviewId: string, productId?: string) {
  await prisma.review.delete({
    where: { id: reviewId },
  });

  if (productId) {
    revalidatePath(`/product/${productId}`);
  }
  revalidatePath('/admin/reviews');
}

export async function toggleReviewApproval(reviewId: string, currentStatus: boolean, productId?: string) {
  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: !currentStatus },
  });

  if (productId) {
    revalidatePath(`/product/${productId}`);
  }
  revalidatePath('/admin/reviews');
}