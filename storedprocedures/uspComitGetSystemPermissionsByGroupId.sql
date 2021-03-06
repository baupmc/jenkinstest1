USE [galaxy_new]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		bonic
-- Create date: 2017-04-20
-- Description:	Get CoMIT System Permissions for a given Group Id
-- =============================================
ALTER PROCEDURE [dbo].[uspComitGetSystemPermissionsByGroupId] (@groupId uniqueidentifier)

AS 

SELECT 
	[Permission].[Id], [Permission].[Value], [PermissionType].[Id] AS [PermissionTypeId], 
	[PermissionType].[Code], [PermissionType].[Name], [PermissionType].[IsSystemPermission] 
FROM [CoMIT_GroupSystemPermission]
	INNER JOIN [Permission] ON [CoMIT_GroupSystemPermission].[PermissionId] = [Permission].[Id]
	INNER JOIN [PermissionType] ON [Permission].[PermissionTypeId] = [PermissionType].[Id]
WHERE [CoMIT_GroupSystemPermission].[GroupId] = @groupId;