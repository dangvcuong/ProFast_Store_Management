'use client'

import React, { useState, useEffect } from 'react';
import { getCompany, deleteCompany, addCompany, updateCompany } from '../models/Company_Model';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import '../screes/csss/Personnel_management.css';

export default function CompanyScreen() {
    const [companys, setCompanys] = useState({});
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    useEffect(() => {
        loadCompanys();
    }, []);

    const loadCompanys = async () => {
        const companyData = await getCompany();
        setCompanys(companyData);
    };

    const handleAdd = async () => {
        if (!name) {
            setDialogMessage('Vui lòng nhập đầy đủ thông tin');
            setDialogOpen(true);
            return;
        }

        const company = { name };
        await addCompany(company);
        loadCompanys();
        resetForm();
    };

    const handleUpdate = async () => {
        if (!id || !name) {
            setDialogMessage('Vui lòng nhập đầy đủ thông tin');
            setDialogOpen(true);
            return;
        }

        const company = { id, name };
        await updateCompany(company);
        loadCompanys();
        resetForm();
    };

    const handleEdit = (company) => {
        setId(company.id);
        setName(company.name);
    };

    const handleDelete = async (id) => {
        await deleteCompany(id);
        loadCompanys();
    };

    const resetForm = () => {
        setId('');
        setName('');
    };

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    const filteredCompanies = Object.keys(companys).filter((key) => {
        const companyName = companys[key].name;
        return removeVietnameseTones(companyName.toLowerCase()).includes(removeVietnameseTones(searchTerm.toLowerCase()));
    });

    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="container p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý hãng</h1>

            <div className="mb-4">
                <Input 
                    placeholder="Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="mb-2"
                />
                <Button onClick={handleAdd} className="mr-2">Thêm</Button>
                <Button onClick={handleUpdate} disabled={!id}>Cập nhật</Button>
            </div>

            <h2 className="text-xl font-semibold mb-2">Danh sách hãng</h2>
            <div className="mb-4">
                <Input
                    placeholder="Nhập tên hãng cần tìm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3"
                />
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompanies.map((key) => (
                            <TableRow key={key}>
                                <TableCell>{companys[key].name}</TableCell>
                                <TableCell>
                                    {companys[key].createdDate
                                        ? formatDate(companys[key].createdDate)
                                        : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit({ id: key, name: companys[key].name })} className="mr-2">Sửa</Button>
                                    <Button onClick={() => handleDelete(key)} variant="destructive">Xóa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thông báo</DialogTitle>
                    </DialogHeader>
                    <p>{dialogMessage}</p>
                </DialogContent>
            </Dialog>
        </div>
    );
}

