"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { UserPlus, MoreHorizontal, Mail, Shield, Ban, Eye, Edit } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "moderator"
  status: "active" | "suspended" | "pending"
  joinDate: string
  lastActive: string
  savedOpportunities: number
  applications: number
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const response = await fetch(`/api/users?limit=100${searchParam}`)
      
      if (response.ok) {
        const data = await response.json()
        // Transform data to match expected interface
        const transformedUsers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          joinDate: user.join_date ? new Date(user.join_date).toISOString().split('T')[0] : '',
          lastActive: user.last_active ? new Date(user.last_active).toISOString().split('T')[0] : '',
          savedOpportunities: user.saved_opportunities || 0,
          applications: user.applications || 0,
        }))
        setUsers(transformedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700"
      case "moderator":
        return "bg-blue-50 text-blue-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "suspended":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <h1 className="text-2xl mb-6">Users</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Users</p>
              <p className="text-2xl">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-2xl text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Suspended</p>
              <p className="text-2xl text-red-600">{stats.suspended}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${getRoleColor(user.role)} text-xs`}>
                        {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></div>
                        <span className="text-sm capitalize">{user.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.joinDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.savedOpportunities} saved</div>
                        <div className="text-muted-foreground">{user.applications} applied</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
