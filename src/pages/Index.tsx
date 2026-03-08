import { useVault } from "@/context/VaultContext";
import { MasterPasswordScreen } from "@/components/MasterPasswordScreen";
import { VaultDashboard } from "@/components/VaultDashboard";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { state } = useVault();

  return (
    <>
      <Helmet>
        <title>SecureVault – Lokaler Passwort-Manager</title>
        <meta name="description" content="Sicherer, clientseitiger Passwort-Manager. Keine Cloud, keine Datenbank – alle Daten bleiben auf deinem Gerät." />
      </Helmet>
      {state.isUnlocked ? <VaultDashboard /> : <MasterPasswordScreen />}
    </>
  );
};

export default Index;
