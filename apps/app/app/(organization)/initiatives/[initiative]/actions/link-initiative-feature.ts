'use server';

import { database } from '@/lib/database';
import type { Feature, Initiative } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const linkInitiativeFeature = async (
  initiativeId: Initiative['id'],
  featureId: Feature['id']
) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to link features");
    }

    await database.feature.update({
      where: { id: featureId },
      data: {
        initiatives: {
          connect: { id: initiativeId },
        },
      },
    });

    revalidatePath(`/initiatives/${initiativeId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
