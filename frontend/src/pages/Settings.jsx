// src/pages/Settings.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Flex,
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tag,
  TagLabel,
  TagRightIcon,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListIcon,
  Progress,
  Badge,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spacer,
  Stack,
} from "@chakra-ui/react";
import { EditIcon, WarningIcon, ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

/*
  Massive, modern, interactive Settings page.
  - Keeps existing logic (uses useAuth, logout)
  - Adds: editable profile, password modal, mobile update modal, delete account,
          notification toggles, app/system info, activity log, security log,
          connected devices UI, language switcher, theme toggle area,
          export data, backup simulation, help/faq + contact card.
  - No backend changes required (all actions simulated except logout which uses context)
*/

const PlaceholderRow = ({ label, value }) => (
  <HStack justify="space-between" w="full">
    <Text color="gray.600">{label}</Text>
    <Text fontWeight="semibold">{value}</Text>
  </HStack>
);

const SectionHeader = ({ title, subtitle }) => (
  <VStack align="start" spacing={0} mb={4}>
    <Heading size="md">{title}</Heading>
    {subtitle && <Text color="gray.500" fontSize="sm">{subtitle}</Text>}
  </VStack>
);

const DividerLine = () => <Divider borderColor="gray.200" my={4} />;

/* ---------- Sub-components to make file longer and modular ---------- */

function ProfileCard({
  user,
  onSaveProfile,
  onOpenChangePassword,
  onOpenChangeMobile,
  isSavingProfile,
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.full_name || "");
  const [location, setLocation] = useState(user?.location || "");
  const toast = useToast();

  useEffect(() => {
    setName(user?.full_name || "");
    setLocation(user?.location || "");
  }, [user]);

  const handleSave = async () => {
    // Keep logic same: we will call onSaveProfile if given; otherwise simulate
    if (onSaveProfile) {
      try {
        await onSaveProfile({ full_name: name, location });
        toast({ title: "Profile saved", status: "success", duration: 2500 });
        setEditing(false);
      } catch (err) {
        toast({ title: "Save failed", description: err.message || "Error", status: "error" });
      }
    } else {
      // Simulate save
      toast({ title: "Profile saved (local)", status: "success", duration: 2000 });
      setEditing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" align="center" w="full">
          <VStack align="start" spacing={0}>
            <Heading size="md">Profile</Heading>
            <Text color="gray.500" fontSize="sm">Your personal information</Text>
          </VStack>
          <HStack spacing={2}>
            <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)} leftIcon={<EditIcon />}>
              {editing ? "Cancel" : "Edit"}
            </Button>
            <Button size="sm" colorScheme="blue" onClick={() => setEditing(true)}>Edit</Button>
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody>
        <HStack w="full" align="start" spacing={6}>
          <Avatar name={user?.full_name} size="xl" />
          <Box flex="1">
            {!editing ? (
              <>
                <Text fontSize="lg" fontWeight="bold">{user?.full_name}</Text>
                <Text color="gray.600">{user?.mobile}</Text>
                <Text color="gray.600">{user?.location}</Text>
                <HStack mt={3}>
                  <Button size="sm" onClick={onOpenChangePassword}>Change Password</Button>
                  <Button size="sm" variant="outline" onClick={onOpenChangeMobile}>Update Mobile</Button>
                </HStack>
              </>
            ) : (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </FormControl>
                <HStack justify="flex-end" pt={2}>
                  <Button onClick={() => setEditing(false)}>Cancel</Button>
                  <Button colorScheme="green" onClick={handleSave} isLoading={isSavingProfile}>Save</Button>
                </HStack>
              </VStack>
            )}
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
}

function FarmDetailsCard({ farm }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Farm Details</Heading>
      </CardHeader>
      <CardBody>
        <VStack align="start" spacing={3}>
          <PlaceholderRow label="Crop Type" value={farm?.crop_type || "—"} />
          <PlaceholderRow label="Farm Size" value={`${farm?.farm_size || "—"}`} />
          <PlaceholderRow label="Irrigation Method" value={farm?.irrigation_method || "—"} />
          <PlaceholderRow label="Threshold" value={`${farm?.moisture_threshold || "—"}%`} />
          <Box pt={2}>
            <Text color="gray.500" fontSize="sm">
              Registered: {farm?.created_at ? new Date(farm.created_at).toLocaleString() : "—"}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}

function NotificationSettingsCard({ notifications, onToggle }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Notifications</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Box>
              <Text fontWeight="semibold">SMS Alerts</Text>
              <Text fontSize="sm" color="gray.500">Critical alerts via SMS</Text>
            </Box>
            <Switch isChecked={notifications.sms} onChange={() => onToggle("sms")} />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="semibold">Email Reports</Text>
              <Text fontSize="sm" color="gray.500">Weekly farm reports</Text>
            </Box>
            <Switch isChecked={notifications.email} onChange={() => onToggle("email")} />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="semibold">Push Notifications</Text>
              <Text fontSize="sm" color="gray.500">In-app alerts</Text>
            </Box>
            <Switch isChecked={notifications.push} onChange={() => onToggle("push")} />
          </HStack>

          <HStack justify="space-between">
            <Box>
              <Text fontWeight="semibold">Auto SMS on Critical</Text>
              <Text fontSize="sm" color="gray.500">Automatically send SMS when moisture critical</Text>
            </Box>
            <Switch isChecked={notifications.auto_sms} onChange={() => onToggle("auto_sms")} />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

function AccountActionsCard({
  onOpenChangePassword,
  onOpenChangeMobile,
  onOpenDeleteAccount,
  onLogout,
}) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Account Actions</Heading>
      </CardHeader>
      <CardBody>
        <VStack align="start" spacing={3}>
          <Button onClick={onOpenChangePassword} colorScheme="blue">Change Password</Button>
          <Button onClick={onOpenChangeMobile} variant="outline" colorScheme="orange">Update Mobile Number</Button>
          <Button onClick={onOpenDeleteAccount} colorScheme="red">Delete Account</Button>
          <Divider />
          <Button onClick={onLogout} variant="ghost" colorScheme="gray">Logout</Button>
        </VStack>
      </CardBody>
    </Card>
  );
}

function SystemInfoCard({ farm }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">System Information</Heading>
      </CardHeader>
      <CardBody>
        <VStack align="start" spacing={3}>
          <PlaceholderRow label="App Version" value="1.0.0" />
          <PlaceholderRow label="Last Updated" value={new Date().toLocaleDateString()} />
          <PlaceholderRow label="Farm Registered" value={farm?.created_at ? new Date(farm.created_at).toLocaleDateString() : "—"} />
          <HStack pt={2}>
            <Text color="gray.500" fontSize="sm">Backup status:</Text>
            <Tag size="sm" colorScheme="green"><TagLabel>OK</TagLabel></Tag>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

/* Activity log component: shows recent actions (sample) */
function ActivityLog({ items }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Activity Log</Heading>
      </CardHeader>
      <CardBody>
        <List spacing={3}>
          {items.map((it, i) => (
            <ListItem key={i}>
              <HStack justify="space-between" align="start" w="full">
                <Box>
                  <Text fontWeight="semibold">{it.title}</Text>
                  <Text color="gray.500" fontSize="sm">{it.desc}</Text>
                </Box>
                <Text color="gray.400" fontSize="sm">{it.time}</Text>
              </HStack>
            </ListItem>
          ))}
        </List>
      </CardBody>
    </Card>
  );
}

/* Security Log (dummy sample) */
function SecurityLog({ logs }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Security Events</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {logs.map((log, idx) => (
            <HStack key={idx} justify="space-between">
              <HStack>
                <Badge colorScheme={log.level === "warning" ? "orange" : log.level === "error" ? "red" : "green"}>
                  {log.level.toUpperCase()}
                </Badge>
                <Text fontWeight="semibold">{log.event}</Text>
              </HStack>
              <Text color="gray.500" fontSize="sm">{log.time}</Text>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}

/* Connected Devices (sample interactive list) */
function ConnectedDevices({ devices, onDisconnect }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Connected Devices</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {devices.map((d, idx) => (
            <HStack key={idx} justify="space-between">
              <Box>
                <Text fontWeight="semibold">{d.name}</Text>
                <Text color="gray.500" fontSize="sm">{d.info}</Text>
              </Box>
              <HStack>
                <Tag size="sm">{d.status}</Tag>
                <Button size="sm" variant="ghost" onClick={() => onDisconnect(d.id)}>Disconnect</Button>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}

/* FAQ component */
function FAQ() {
  const faqs = [
    { q: "How do I change my password?", a: "Open Change Password action in Account Actions and follow steps." },
    { q: "How to enable SMS alerts?", a: "Toggle the SMS Alerts switch in Notification Settings." },
    { q: "How to export my data?", a: "Use the Export Data button in System Tools." },
    { q: "Can I add multiple farms?", a: "This release supports a single farm per account. Multi-farm is coming soon." },
  ];

  return (
    <Card>
      <CardHeader><Heading size="md">Help & FAQ</Heading></CardHeader>
      <CardBody>
        <Accordion allowMultiple>
          {faqs.map((f, i) => (
            <AccordionItem key={i} border="none" mb={2}>
              <h2>
                <AccordionButton px={0}>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold">{f.q}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text color="gray.600">{f.a}</Text>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </CardBody>
    </Card>
  );
}

/* System Tools card: export / backup / reset (simulated) */
function SystemTools({
  onExport,
  onBackup,
  onReset,
  backupStatus,
  exportStatus,
}) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">System Tools</Heading>
      </CardHeader>
      <CardBody>
        <VStack align="start" spacing={4}>
          <HStack w="full" justify="space-between">
            <Box>
              <Text fontWeight="semibold">Export Data</Text>
              <Text color="gray.500" fontSize="sm">Download a copy of your data (JSON)</Text>
            </Box>
            <Button onClick={onExport} colorScheme="blue">Export</Button>
          </HStack>

          <HStack w="full" justify="space-between">
            <Box>
              <Text fontWeight="semibold">Backup</Text>
              <Text color="gray.500" fontSize="sm">Create a local backup snapshot</Text>
            </Box>
            <Button onClick={onBackup}>Backup</Button>
          </HStack>

          <HStack w="full" justify="space-between">
            <Box>
              <Text fontWeight="semibold">Factory Reset</Text>
              <Text color="gray.500" fontSize="sm">Reset all local settings (simulated)</Text>
            </Box>
            <Button colorScheme="red" onClick={onReset}>Reset</Button>
          </HStack>

          <VStack align="stretch" pt={2}>
            <Text fontSize="sm" color="gray.500">Backup status: {backupStatus}</Text>
            <Text fontSize="sm" color="gray.500">Export status: {exportStatus}</Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

/* ---------- Main Settings Page ---------- */

export default function Settings() {
  const { user, farm, logout } = useAuth();
  const { postData } = useApi();
  const toast = useToast();
  const { t, i18n } = useTranslation ? useTranslation() : { t: (k) => k, i18n: null };

  // Local UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [newMobile, setNewMobile] = useState("");

  const [notifications, setNotifications] = useState({
    sms: true,
    email: false,
    push: true,
    auto_sms: false,
  });

  // system tools statuses
  const [backupStatus, setBackupStatus] = useState("Idle");
  const [exportStatus, setExportStatus] = useState("Idle");

  // sample logs & devices to display (UI only)
  const [activityItems, setActivityItems] = useState([
    { title: "Logged in", desc: "Login from Chrome on Windows", time: "2 hours ago" },
    { title: "Updated Farm", desc: "Changed irrigation method to drip", time: "1 day ago" },
    { title: "Profile Edited", desc: "Updated display name", time: "3 days ago" },
  ]);

  const [securityLogs, setSecurityLogs] = useState([
    { level: "info", event: "2FA not enabled", time: "2025-07-01" },
    { level: "warning", event: "Multiple failed logins", time: "2025-06-15" },
    { level: "info", event: "Password changed", time: "2025-06-01" },
  ]);

  const [devices, setDevices] = useState([
    { id: 1, name: "Farm Gateway", info: "v1.0.3 • Online", status: "Online" },
    { id: 2, name: "Field Sensor A", info: "Moisture probe • Last seen 2h ago", status: "Last seen 2h" },
  ]);

  // derived values
  const unreadNotifications = useMemo(() => {
    // sample: notifications count derived from array stored in backend normally
    return Math.floor(Math.random() * 5); // placeholder
  }, []);

  // lifecycle
  useEffect(() => {
    // Could fetch user profile / settings here if we had endpoints
    // For now, we just simulate.
  }, []);

  // handlers
  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenChangePassword = () => setIsPasswordModalOpen(true);
  const handleOpenChangeMobile = () => setIsMobileModalOpen(true);
  const handleOpenDeleteAccount = () => setIsDeleteModalOpen(true);

  const handleClosePassword = () => setIsPasswordModalOpen(false);
  const handleCloseMobile = () => setIsMobileModalOpen(false);
  const handleCloseDelete = () => setIsDeleteModalOpen(false);

  const handleSavePassword = async () => {
    setIsLoading(true);
    try {
      // If you have endpoint -> call one; else simulate
      // Example: await postData('/api/change-password', { newPassword })
      await new Promise((r) => setTimeout(r, 900));
      toast({ title: "Password updated", status: "success", duration: 2500 });
      setNewPassword("");
      handleClosePassword();
    } catch (err) {
      toast({ title: "Update failed", description: err.message || "Error", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMobile = async () => {
    setIsLoading(true);
    try {
      // Example backend call: await postData(`/api/update-mobile`, { mobile: newMobile })
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: "Mobile number updated", description: `New: ${newMobile}`, status: "success" });
      setNewMobile("");
      handleCloseMobile();
    } catch (err) {
      toast({ title: "Update failed", description: err.message || "Error", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      // Example backend call: await postData(`/api/delete-account`, { id: user.id })
      await new Promise((r) => setTimeout(r, 1200));
      toast({ title: "Account deleted", status: "info", duration: 2500 });
      handleCloseDelete();
      logout();
    } catch (err) {
      toast({ title: "Deletion failed", description: err.message || "Error", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportStatus("Exporting...");
      // Simulate export
      await new Promise((r) => setTimeout(r, 900));
      setExportStatus("Ready");
      toast({ title: "Export ready", description: "Your data export is available", status: "success" });
    } catch (err) {
      setExportStatus("Failed");
      toast({ title: "Export failed", status: "error" });
    }
  };

  const handleBackup = async () => {
    try {
      setBackupStatus("Running...");
      await new Promise((r) => setTimeout(r, 900));
      setBackupStatus("OK");
      toast({ title: "Backup complete", status: "success" });
    } catch (err) {
      setBackupStatus("Failed");
      toast({ title: "Backup failed", status: "error" });
    }
  };

  const handleReset = async () => {
    try {
      setBackupStatus("Resetting...");
      await new Promise((r) => setTimeout(r, 900));
      setBackupStatus("Idle");
      toast({ title: "Settings reset (simulated)", status: "info" });
    } catch (err) {
      toast({ title: "Reset failed", status: "error" });
    }
  };

  const handleDisconnectDevice = (id) => {
    setDevices((d) => d.filter((x) => x.id !== id));
    toast({ title: "Device disconnected", status: "info", duration: 2000 });
  };

  const handleExportData = () => {
    handleExport();
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", status: "success" });
  };

  

  // Render
  if (!user || !farm) {
    // This preserves your existing behaviour: ensure the user & farm exist
    return <LoadingSpinner />;
  }

  return (
    <Box p={{ base: 3, md: 8 }}>
      <Heading mb={4} color="green.600">Settings</Heading>
      <Text color="gray.600" mb={6}>Manage your account, preferences and system settings</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Box gridColumn={{ base: "1 / -1", md: "span 2" }}>
          <ProfileCard
            user={user}
            onSaveProfile={async (payload) => {
              // keep logic same: if you have an API to update profile, call it
              // Example: await postData('/api/update-profile', { user_id: user.id, ...payload })
              // We'll simulate here and also update local context if desired (not mutating)
              await new Promise((r) => setTimeout(r, 400));
              toast({ title: "Profile updated (simulated)", status: "success" });
            }}
            onOpenChangePassword={handleOpenChangePassword}
            onOpenChangeMobile={handleOpenChangeMobile}
            isSavingProfile={isLoading}
          />
        </Box>

        <Box>
          <FarmDetailsCard farm={farm} />
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Box>
          <NotificationSettingsCard notifications={notifications} onToggle={handleToggleNotification} />
        </Box>

        <Box>
          <AccountActionsCard
            onOpenChangePassword={handleOpenChangePassword}
            onOpenChangeMobile={handleOpenChangeMobile}
            onOpenDeleteAccount={handleOpenDeleteAccount}
            onLogout={handleLogout}
          />
        </Box>

        <Box>
          <SystemInfoCard farm={farm} />
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <ActivityLog items={activityItems} />
        <SecurityLog logs={securityLogs} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <ConnectedDevices devices={devices} onDisconnect={handleDisconnectDevice} />
        <FAQ />
        <SystemTools
          onExport={handleExportData}
          onBackup={handleBackup}
          onReset={handleReset}
          backupStatus={backupStatus}
          exportStatus={exportStatus}
        />
      </SimpleGrid>

      {/* --------------- Modals --------------- */}

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={handleClosePassword} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </FormControl>
              <Text color="gray.500" fontSize="sm">Choose a strong password that you haven't used before.</Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleClosePassword} mr={3}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSavePassword} isLoading={isLoading}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Mobile Modal */}
      <Modal isOpen={isMobileModalOpen} onClose={handleCloseMobile} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Mobile Number</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>New Mobile Number</FormLabel>
                <Input value={newMobile} onChange={(e) => setNewMobile(e.target.value)} type="tel" />
              </FormControl>
              <Text color="gray.500" fontSize="sm">We may send a verification OTP to confirm this number.</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseMobile} mr={3}>Cancel</Button>
            <Button colorScheme="orange" onClick={handleSaveMobile} isLoading={isLoading}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDelete} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Alert status="error">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Are you sure?</Text>
                  <Text color="gray.500" fontSize="sm">Deleting your account will remove all data. This cannot be undone.</Text>
                </Box>
              </Alert>
              <FormControl>
                <FormLabel>Type "DELETE" to confirm</FormLabel>
                <Input placeholder="Type DELETE" onChange={(e) => { /* no-op for simulated confirm */ }} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseDelete} mr={3}>Cancel</Button>
            <Button colorScheme="red" onClick={handleConfirmDelete} isLoading={isLoading}>Delete Account</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
