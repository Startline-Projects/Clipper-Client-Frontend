import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import Header from '@/components/ui/Header';
import Avatar from '@/components/ui/Avatar';
import Btn from '@/components/ui/Btn';
import TextField from '@/components/forms/TextField';
import PhotoPickerSheet from '@/components/sheets/PhotoPickerSheet';
import { ProfileSkeleton } from '@/components/feedback/SkeletonVariants';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { useColors } from '@/lib/theme/colors';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';
import { pickImage } from '@/lib/utils/pick-image';
import type { RNFile } from '@/lib/api/profile';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const sheetRef = useRef<BottomSheet>(null);

  const [name, setName] = useState(profile?.name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [photo, setPhoto] = useState<RNFile | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const openSheet = () => sheetRef.current?.expand();
  const closeSheet = () => sheetRef.current?.close();

  const pickFromLibrary = async () => {
    closeSheet();
    const file = await pickImage({ source: 'library', fileNamePrefix: 'profile' });
    if (file) {
      setPhoto(file);
      setPhotoUri(file.uri);
      setPhotoRemoved(false);
    }
  };

  const takePhoto = async () => {
    closeSheet();
    const file = await pickImage({ source: 'camera', fileNamePrefix: 'profile' });
    if (file) {
      setPhoto(file);
      setPhotoUri(file.uri);
      setPhotoRemoved(false);
    }
  };

  const removePhoto = () => {
    closeSheet();
    setPhoto(null);
    setPhotoUri(null);
    setPhotoRemoved(true);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    if (!trimmedName) {
      showErrorToast(null, 'Please enter your name.');
      return;
    }

    update.mutate(
      {
        name: trimmedName,
        username: trimmedUsername || undefined,
        photo: photo ?? undefined,
      },
      {
        onSuccess: () => {
          showSuccessToast('Profile updated');
          router.back();
        },
        onError: (err) => {
          if (photo) {
            Alert.alert(
              'Photo upload failed',
              'Your photo could not be saved. Please try a different image or try again later.',
            );
          } else {
            showErrorToast(err);
          }
        },
      },
    );
  };

  if (isLoading || !profile) return <ProfileSkeleton />;

  const displayUri = photoRemoved
    ? undefined
    : (photoUri ?? profile.profilePhotoUrl ?? undefined);

  const hasExistingPhoto = !photoRemoved && !!(photoUri || profile.profilePhotoUrl);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="px-5">
          <Header title="Edit Profile" onBack={() => router.back()} />
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
        >
          <View className="items-center mb-6 mt-2">
            <Pressable onPress={openSheet} className="active:opacity-70">
              <Avatar name={name || profile.name} size={90} uri={displayUri} />
              <View
                style={{ backgroundColor: colors.brand }}
                className="absolute bottom-0 right-0 w-[28px] h-[28px] rounded-full items-center justify-center border-[2.5px] border-surface"
              >
                <Text className="text-white text-[12px] font-bold">+</Text>
              </View>
            </Pressable>
            <Text className="text-[13px] text-secondary mt-2">
              Tap to change photo
            </Text>
          </View>

          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
          />

          <View className="h-4" />

          <TextField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="@username"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View className="mt-6">
            <Btn
              label={update.isPending ? 'Saving...' : 'Save Changes'}
              full
              onPress={handleSave}
              disabled={update.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PhotoPickerSheet
        ref={sheetRef}
        hasPhoto={hasExistingPhoto}
        onTakePhoto={takePhoto}
        onChooseLibrary={pickFromLibrary}
        onRemovePhoto={removePhoto}
        onCancel={closeSheet}
      />
    </SafeAreaView>
  );
}
