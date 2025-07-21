<template>
  <div class="flex flex-col w-full">
    <h1 class="text-3xl font-bold mb-6">Galéria Komponentov</h1>
    <h3 class="text-2xl font-bold mb-4">Tlačidlá</h3>
    <div
      id="buttons"
      class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mb-12">
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        :variant="variant as any">
        {{ buttonVariantTranslations[variant] }}
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        icon="ph:nut"
        :variant="variant as any">
        {{ buttonVariantTranslations[variant] }} - Ikona
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        external
        :variant="variant as any">
        {{ buttonVariantTranslations[variant] }} - Externý
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        disabled
        :variant="variant as any">
        {{ buttonVariantTranslations[variant] }} - Znefunkčnený
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        size="header"
        :variant="variant as any">
        {{ buttonVariantTranslations[variant] }} - Hlavička
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        size="dialog"
        :variant="variant as any">
        {{ buttonVariantTranslations[variant] }} - Dialóg
      </AppButton>
    </div>
    <h3 class="text-2xl font-bold mb-4">Polia</h3>
    <div
      id="fields"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormField
        v-for="size in fieldSizes"
        :key="size"
        :size="size as any"
        placeholder="Pole (Text)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-number'"
        :size="size as any"
        type="number"
        placeholder="Pole (Číslo)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-password'"
        :size="size as any"
        type="password"
        placeholder="Pole (Heslo)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-email'"
        :size="size as any"
        type="email"
        placeholder="Pole (Email)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-tel'"
        :size="size as any"
        type="tel"
        placeholder="Pole (Telefón)" />
    </div>
    <h3 class="text-2xl font-bold mb-4">Kalendár</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormCalendar
        v-model:model-value="calendarValue"
        @update:model-value="(value) => console.log('Selected date:', value)" />
      <FormCalendar size="dialog" />
    </div>
    <h3 class="text-2xl font-bold mb-4">Rozbaľovacia ponuka</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormDropdown
        :options="[
          { label: 'Možnosť 1', value: '1' },
          { label: 'Možnosť 2', value: '2' },
        ]"
        @select="(value) => console.log('Selected:', value)"
        placeholder="Vyberte možnosť" />
      <FormDropdown
        :options="[
          { label: 'Možnosť 1', value: '1' },
          { label: 'Možnosť 2', value: '2' },
        ]"
        size="dialog"
        placeholder="Vyberte možnosť" />
      <FormDropdown
        :options="[
          { label: 'Možnosť 1', value: '1' },
          { label: 'Možnosť 2', value: '2' },
        ]"
        @select="(value) => console.log('Selected:', value)"
        v-model="dropdownValue"
        label="Názov"
        searchable
        placeholder="Hľadať možnosti" />
      <FormDropdown
        icons
        :options="[
          { label: 'Možnosť 1', value: '1', disabled: true, icon: 'ph:nut' },
          { label: 'Možnosť 2', value: '2', icon: 'ph:gear' },
          { label: 'Možnosť 3', value: '3', icon: 'ph:star' },
        ]"
        size="dialog"
        searchable
        placeholder="Hľadať možnosti"
        @select="(value) => console.log('Selected:', value)" />
    </div>
    <h3 class="text-2xl font-bold mb-4">Obal</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormWrapper title="Názov" hint="Toto je nápoveda">
        <FormField placeholder="Zabalené pole" />
      </FormWrapper>
      <FormWrapper title="Názov" size="dialog" hint="Toto je nápoveda">
        <FormField size="dialog" placeholder="Zabalené pole" />
      </FormWrapper>
    </div>
    <h3 class="text-2xl font-bold mb-4">Zaškrtávacie políčko</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12">
      <FormCheckbox label="Zaškrtávacie políčko 1" />
      <FormCheckbox
        label="Toto je viacriadkový popis zaškrtávacieho políčka, ktorý by sa mal zalomiť na ďalší riadok, ak je príliš dlhý. Toto je viacriadkový popis zaškrtávacieho políčka, ktorý by sa mal zalomiť na." />
    </div>
    <h3 class="text-2xl font-bold mb-4">Notifikácie</h3>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-12">
      <AppButton @click="showInfoToast">
        Zobraziť informačnú notifikáciu
      </AppButton>
      <AppButton @click="showWarningToast">
        Zobraziť varovnú notifikáciu
      </AppButton>
      <AppButton @click="showActionToast">
        Zobraziť notifikáciu s akciou
      </AppButton>
    </div>
    <h3 class="text-2xl font-bold mb-4">Upozornenia</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <AppButton @click="showInfoAlert">
        Zobraziť informačné upozornenie
      </AppButton>
      <AppButton @click="showCriticalAlert">
        Zobraziť kritické upozornenie
      </AppButton>
    </div>
    <h3 class="text-2xl font-bold mb-4">Číselné pole</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12">
      <FormNumber size="default" :min="0" :max="100" :step="1" />
      <FormNumber size="dialog" :min="0" :max="100" :step="1" />
    </div>
    <h3 class="text-2xl font-bold mb-4">Upravovateľné pole</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12">
      <FormEditable v-model="quick" />
      <FormEditable size="dialog" placeholder="Zadajte text..." auto-resize />
    </div>
    <h3 class="text-2xl font-bold mb-4">Interakcia pri prejdení</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12">
      <ClientOnly>
        <AppHoverable>
          <AppButton>Ukáž na mňa kurzorom</AppButton>
          <template #content>
            <div class="text-black">Toto je obsah pri prejdení myšou.</div>
          </template>
        </AppHoverable>
        <AppHoverable>
          <AppButton>Ukáž kurzorom aj na mňa</AppButton>
          <template #content>
            <div class="text-black">
              Toto je ďalší obsah pri prejdení myšou.
            </div>
          </template>
        </AppHoverable>
      </ClientOnly>
    </div>
    <h3 class="text-2xl font-bold mb-4">Tooltip</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12">
      <ClientOnly>
        <AppTooltip content="Toto je tooltip.">
          <AppButton>Tooltip</AppButton>
        </AppTooltip>
        <AppTooltip content="Toto je ďalší tooltip.">
          <span>Text s tooltipom</span>
        </AppTooltip>
      </ClientOnly>
    </div>
    <h3 class="text-2xl font-bold mb-4">Názov sekcie</h3>
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12 text-black">
      <FormSectionTitle title="Sekcia 1" icon="ph:star-fill" />
      <FormSectionTitle title="Sekcia 2" icon="ph:heart-fill" />
      <FormSectionTitle title="Sekcia 3" icon="ph:bell-fill" />
      <FormSectionTitle title="Sekcia 4" icon="ph:check-circle-fill" />
    </div>
    <h3 class="text-2xl font-bold mb-4">Dialóg s obsahom</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <ClientOnly>
        <AppContentDialog title="Jednoduchý dialóg s obsahom">
          <template #trigger>
            <AppButton>Zobraziť jednoduchý dialóg</AppButton>
          </template>
          <span>Toto je obsah jednoduchého dialógu.</span>
        </AppContentDialog>
        <AppContentDialog
          title="Dialóg s akciami"
          action-text="Potvrdiť"
          @action="onDialogAction">
          <template #trigger>
            <AppButton>Zobraziť dialóg s akciami</AppButton>
          </template>
          <span>Tento dialóg má akcie.</span>
        </AppContentDialog>
        <AppContentDialog
          title="Dialóg s preventívnou akciou"
          action-text="Potvrdiť"
          @action="onPreventableDialogAction">
          <template #trigger>
            <AppButton>Zobraziť dialóg s preventívnou akciou</AppButton>
          </template>
          <span>Tento dialóg sa nezatvorí po kliknutí na tlačidlo akciu.</span>
        </AppContentDialog>
        <AppContentDialog
          action-text="Potvrdiť"
          title="Vytvoriť debatný klub"
          icon="ph:plus-circle-fill"
          @action="createClub"
          @close="onClubDialogClose"
          :disabled="!canSubmitClubCreation">
          <template #trigger>
            <AppButton>Zobraziť dynamický dialóg</AppButton>
          </template>
          <div class="flex flex-col w-full gap-4">
            <FormWrapper title="Názov klubu">
              <FormField
                v-model="club.name"
                size="dialog"
                placeholder="Sučany" />
            </FormWrapper>
            <FormWrapper title="Debatný program">
              <FormDropdown
                v-model="club.league"
                :options="leagues"
                size="dialog"
                placeholder="Liga klubu"
                label="Liga klubu" />
            </FormWrapper>
          </div>
        </AppContentDialog>
      </ClientOnly>
    </div>
    <h3 class="text-2xl font-bold mb-4">Editor</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <AppEditor
        content="<h3>Plný editor</h3><p>Tu môžete písať a formátovať text.</p>
<p>Podporované formátovanie:</p>
<ul>
  <li><b>Tučné písmo</b></li>
  <li><i>Kurzíva</i></li>
  <li><u>Podčiarknuté</u></li>
</ul>" />
      <AppEditor
        layout="minimal"
        ref="editor"
        content="<h3>Tento editor je minimalizovaný.</h3>
        <p>Je určený na použitia ako samostatný komponent na stránke.</p>">
        <AppButton size="dialog" @click="saveContent">Uložiť</AppButton>
      </AppEditor>
    </div>
  </div>
</template>

<script setup lang="ts">
// ------------------- IMPORTS -------------------
import { useToast } from "~/composables/useToast";
import { useAlert } from "~/composables/useAlert";

definePageMeta({
  layout: "management",
});

// ------------------- BUTTONS -------------------
const buttonVariants = ["primary", "secondary", "tertiary", "ghost"];
const buttonVariantTranslations: Record<string, string> = {
  primary: "Primárne",
  secondary: "Sekundárne",
  tertiary: "Terciárne",
  ghost: "Duch",
};

// ------------------- FIELDS -------------------
const fieldSizes = ["default", "dialog"];

// ------------------- CALENDAR -------------------
const calendarValue = "2007-01-01";

// ------------------- DROPDOWN -------------------
const dropdownValue = ref("1");

// ------------------- EDITABLE -------------------
const quick = ref("Uprav ma rýchlo");

// ------------------- TOASTS (NOTIFIKÁCIE) -------------------
const { addToast } = useToast();

const showInfoToast = () => {
  addToast({
    text: "Účet bol vytvorený. Pre plný prístup k funkciám Platformy DN Cascade sa staň členom SDA.",
    autoClose: false,
    action: {
      text: "Stať sa členom SDA",
      onClick: () => {
        console.log("Action clicked!");
      },
    },
  });
};

const showWarningToast = () => {
  addToast({
    title: "Varovanie",
    text: "Toto je varovná notifikácia.",
    variant: "warning",
  });
};

const showActionToast = () => {
  addToast({
    title: "Akcia",
    text: "Toto je notifikácia s akciou.",
    action: {
      text: "Prejsť do galérie",
      to: "/dev/gallery",
    },
  });
};

// ------------------- ALERTS (UPOZORNENIA) -------------------
const { showAlert } = useAlert();

const showInfoAlert = () => {
  showAlert({
    title: "Upozornenie",
    content: "Toto je upozornenie, prajete si pokračovať?",
    variant: "warning",
    continueText: "Pokračovať",
    onContinue: () => {
      alert("Upozornenie pokračovalo!");
    },
    cancelText: "Zrušiť",
    onCancel: () => {
      alert("Upozornenie zrušené!");
    },
  });
};

const showCriticalAlert = () => {
  showAlert({
    title: "Kritické upozornenie",
    content: "Toto je kritické upozornenie, prajete si pokračovať?",
    variant: "critical",
    continueText: "Pokračovať",
    cancelText: "Zrušiť",
    onContinue: () => {
      alert("Kritické upozornenie pokračovalo!");
    },
    onCancel: () => {
      alert("Kritické upozornenie zrušené!");
    },
  });
};

// ------------------- CONTENT DIALOG -------------------
const onDialogAction = () => {
  alert("Akcia dialógu bola kliknutá!");
};

const onPreventableDialogAction = ({
  preventClose,
}: {
  preventClose: () => void;
}) => {
  preventClose();
  alert("Akcia bola kliknutá, ale dialóg sa nezatvoril!");
};

const club = ref({
  name: "",
  league: "senior",
});

const canSubmitClubCreation = computed(() => {
  return club.value.name.trim() !== "" && club.value.league !== "";
});

const leagues = [
  { label: "SDP", value: "senior" },
  { label: "ZDP", value: "junior" },
  { label: "VDP", value: "university" },
];

const createClub = ({ preventClose }: { preventClose: () => void }) => {
  if (club.value.name.trim() !== "" && club.value.league !== "") {
    addToast({
      title: "Klub vytvorený",
      text: `Klub ${club.value.name} bol úspešne vytvorený v lige ${club.value.league}.`,
      variant: "info",
    });

    club.value.name = "";
    club.value.league = "senior";
  } else {
    preventClose(); // Prevent dialog from closing when form is incomplete
  }
};

const onClubDialogClose = () => {
  club.value.name = "";
  club.value.league = "senior";
};

// ------------------- EDITOR -------------------
const editor = ref<any>(null);

const saveContent = () => {
  const content = editor.value?.getContent();
  alert(content);
};
</script>

<style scoped></style>
