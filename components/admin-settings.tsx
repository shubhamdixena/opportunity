"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Switch } from "./ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Server,
  Users,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

export function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "OpportunityHub",
    siteDescription: "Discover scholarships, fellowships, grants, conferences, and competitions from around the world",
    contactEmail: "admin@opportunityhub.com",
    supportEmail: "support@opportunityhub.com",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    moderationEnabled: true,
    autoApproval: false,
    sessionTimeout: "30",
    passwordMinLength: "8",
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Site Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Site Name</label>
                  <Input value={settings.siteName} onChange={(e) => handleSettingChange("siteName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Contact Email</label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange("contactEmail", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Site Description</label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Support Email</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleSettingChange("supportEmail", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Platform Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Maintenance Mode</div>
                  <div className="text-xs text-muted-foreground">Temporarily disable public access</div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">User Registration</div>
                  <div className="text-xs text-muted-foreground">Allow new user signups</div>
                </div>
                <Switch
                  checked={settings.userRegistration}
                  onCheckedChange={(checked) => handleSettingChange("userRegistration", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Content Moderation</div>
                  <div className="text-xs text-muted-foreground">Review user submissions</div>
                </div>
                <Switch
                  checked={settings.moderationEnabled}
                  onCheckedChange={(checked) => handleSettingChange("moderationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Auto-approve New Users</div>
                  <div className="text-xs text-muted-foreground">Skip manual approval process</div>
                </div>
                <Switch
                  checked={settings.autoApproval}
                  onCheckedChange={(checked) => handleSettingChange("autoApproval", checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Password Min Length</label>
                  <Input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">Send system notifications via email</div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm">Notification Types</h4>
                <div className="space-y-3">
                  {[
                    { id: "welcome", label: "Welcome emails", enabled: true },
                    { id: "deadline", label: "Deadline reminders", enabled: true },
                    { id: "weekly", label: "Weekly digest", enabled: false },
                    { id: "admin", label: "Admin alerts", enabled: true },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between">
                      <span className="text-sm">{notification.label}</span>
                      <Switch defaultChecked={notification.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                SMTP Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">SMTP Host</label>
                  <Input placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SMTP Port</label>
                  <Input placeholder="587" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Username</label>
                  <Input type="email" placeholder="your-email@domain.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { id: "2fa", label: "Require 2FA for admin accounts", enabled: true },
                  { id: "recaptcha", label: "Enable reCAPTCHA for forms", enabled: true },
                  { id: "bruteforce", label: "Brute force protection", enabled: true },
                  { id: "https", label: "Force HTTPS connections", enabled: true },
                ].map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between">
                    <span className="text-sm">{feature.label}</span>
                    <Switch defaultChecked={feature.enabled} />
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4">
                  <div>
                    <div className="text-sm">API Status</div>
                    <div className="text-xs text-muted-foreground">Public API endpoints</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    Active
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Regenerate API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg text-green-600 dark:text-green-400">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg text-blue-600 dark:text-blue-400">847</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-lg text-orange-600 dark:text-orange-400">68%</div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg text-purple-600 dark:text-purple-400">2.4 GB</div>
                  <div className="text-xs text-muted-foreground">Database</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4" />
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-sm">Last Backup</div>
                  <div className="text-xs text-muted-foreground">2024-03-11 02:00</div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  Healthy
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-1 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs">Run Backup</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-1 bg-transparent"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-xs">Optimize DB</span>
                </Button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800/60">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Maintenance Window</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Scheduled maintenance: 2:00 AM - 4:00 AM UTC
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
