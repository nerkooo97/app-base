import { getUserWithProfileAndRoles } from '@/lib/auth';
import ProfileHeader from '@/components/profile/profile-header';
import PersonalInfoForm from '@/components/profile/personal-info-form';
import SecurityForm from '@/components/profile/security-form';
import MfaSetup from '@/components/profile/mfa-setup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield } from 'lucide-react';

export default async function ProfilePage() {
    const user = await getUserWithProfileAndRoles();

    if (!user) return null;

    return (
        <div className="space-y-8">
            <ProfileHeader />

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="bg-gray-50/50 border border-gray-100 p-1 h-12 rounded-xl mb-6">
                    <TabsTrigger
                        value="personal"
                        className="rounded-lg px-6 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-full"
                    >
                        <User className="h-4 w-4" />
                        Lični podaci
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="rounded-lg px-6 font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-full"
                    >
                        <Shield className="h-4 w-4" />
                        Sigurnost
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <PersonalInfoForm initialFullName={user.profile?.full_name || ''} />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <SecurityForm currentEmail={user.email || ''} />
                    <MfaSetup />
                </TabsContent>
            </Tabs>
        </div>
    );
}
